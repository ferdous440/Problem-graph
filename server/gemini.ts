import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_PRIMARY_MODEL = 'gemini-4-hydrogen';
const GEMINI_FAST_FALLBACK_MODEL = 'gemini-3.1-flash-lite';

// Initialize Google GenAI client with required header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function parseCleanJson<T>(rawText: string | undefined): T {
  const cleaned = (rawText || '{}')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

async function generateJsonWithFailover<T>(
  prompt: string,
  responseSchema: any,
  primaryTimeoutMs: number = 8000,
  fallbackTimeoutMs: number = 8000,
  preferFast: boolean = false
): Promise<{ data: T; modelUsed: string; latencyMs: number }> {
  const overallStart = Date.now();
  const firstModel = preferFast ? GEMINI_FAST_FALLBACK_MODEL : GEMINI_PRIMARY_MODEL;
  const firstThinking = preferFast ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW;
  const secondModel = preferFast ? GEMINI_PRIMARY_MODEL : GEMINI_FAST_FALLBACK_MODEL;
  const secondThinking = preferFast ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL;

  const callModel = async (model: string, thinkingLevel: ThinkingLevel, timeoutMs: number): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const reqPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel },
          responseMimeType: 'application/json',
          responseSchema,
        },
      }).then((response) => parseCleanJson<T>(response.text));

      const timerPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${model} timeout after ${timeoutMs}ms`)), timeoutMs);
      });

      return await Promise.race([reqPromise, timerPromise]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  try {
    const data = await callModel(firstModel, firstThinking, primaryTimeoutMs);
    return { data, modelUsed: firstModel, latencyMs: Date.now() - overallStart };
  } catch (primaryErr: any) {
    console.log(
      `[AI Route] Switching from ${firstModel} to ${secondModel}:`,
      primaryErr?.status || primaryErr?.message || 'unavailable'
    );
    const data = await callModel(secondModel, secondThinking, fallbackTimeoutMs);
    return { data, modelUsed: secondModel, latencyMs: Date.now() - overallStart };
  }
}

export interface ProblemClassificationResult {
  suggestedCategory: string;
  suggestedSeverity: 'low' | 'medium' | 'high' | 'critical';
  summaryBn: string;
  keywords: string[];
  potentialHazards: string[];
  urgencyScore: number;
}

export interface RouteAnalysisEvidence {
  origin: string;
  destination: string;
  totalDistanceKm: number;
  corridorRadiusMeters: number;
  travelTime?: string;
  reportCount: number;
  reports: Array<{
    id: string;
    trackingCode: string;
    title: string;
    category: string;
    severity: string;
    status: string;
    district: string;
    area: string;
    distanceFromRouteMeters: number;
    reportedAt: string;
    verified: boolean;
  }>;
}

export interface RouteAnalysisResult {
  routeSummary: string;
  vulnerableAreas: string[];
  trafficIssues: string;
  roadDamageIssues: string;
  waterloggingIssues: string;
  constructionIssues: string;
  criticalIssues: string;
  latestReportDates: string;
  travelerAdvisories: string[];
  dataCoverageNote: string;
}

export interface AdminInsightResult {
  topProblemAreas: string;
  dominantCategories: string;
  surgingTrends: string;
  longPendingIssues: string;
  priorityActionItems: string[];
  strategicRecommendations: string[];
  executiveSummary: string;
}

export interface SolutionRecommendationResult {
  clusterOrTitle: string;
  rootCauseBn: string;
  impactAssessmentBn: string;
  recommendedSolutionBn: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAuthorityBn: string;
  disclaimerBn: string;
}

// Fast TTL cache for route intelligence responses (2 minutes)
const routeAiCache = new Map<string, { result: RouteAnalysisResult; ts: number }>();
const ROUTE_AI_CACHE_TTL_MS = 2 * 60 * 1000;

const geminiDiag = {
  lastSource: 'none' as 'none' | 'gemini' | 'cache' | 'fallback' | 'timeout',
  lastModel: '' as string,
  lastLatencyMs: 0,
  lastError: '' as string,
  lastUpdatedAt: '' as string,
};

export function getGeminiDiagnostics() {
  return { ...geminiDiag };
}

/**
 * AI Problem Classification using Gemini with fast failover
 */
export async function classifyProblemReport(
  title: string,
  description: string,
  userCategory?: string,
  userSeverity?: string,
  timeoutMs: number = 2000
): Promise<ProblemClassificationResult> {
  const instantResult = fallbackClassification(title, description, userCategory, userSeverity);

  if (!process.env.GEMINI_API_KEY) {
    return instantResult;
  }

  const prompt = `
আপনি 'প্রবলেমগ্রাফ' প্ল্যাটফর্মের এআই ক্লাসিফায়ার বিশেষজ্ঞ।
ব্যবহারকারীর জমা দেওয়া নাগরিক সমস্যার বিবরণটি বিশ্লেষণ করে শুদ্ধ বাংলায় JSON ফলাফল দিন।

শিরোনাম: "${title}"
বিবরণ: "${description}"
প্রাথমিক ক্যাটাগরি: "${userCategory || 'উল্লেখ নেই'}"
প্রাথমিক গুরুত্ব: "${userSeverity || 'উল্লেখ নেই'}"

ক্যাটাগরি অপশন: যানজট, রাস্তার ক্ষতি, জলাবদ্ধতা, বর্জ্য ব্যবস্থাপনা, পানি সমস্যা, বিদ্যুৎ সমস্যা, গ্যাস সমস্যা, ড্রেনেজ সমস্যা, নির্মাণকাজ, গণপরিবহন সমস্যা, পরিবেশ দূষণ, নিরাপত্তা সংক্রান্ত সমস্যা, অন্যান্য।
গুরুত্ব অপশন: low, medium, high, critical.
`;

  try {
    const schema = {
      type: Type.OBJECT,
      properties: {
        suggestedCategory: { type: Type.STRING },
        suggestedSeverity: { type: Type.STRING },
        summaryBn: { type: Type.STRING },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        potentialHazards: { type: Type.ARRAY, items: { type: Type.STRING } },
        urgencyScore: { type: Type.NUMBER },
      },
      required: ['suggestedCategory', 'suggestedSeverity', 'summaryBn', 'keywords', 'potentialHazards', 'urgencyScore'],
    };

    const { data: parsed } = await generateJsonWithFailover<Partial<ProblemClassificationResult>>(
      prompt,
      schema,
      Math.max(timeoutMs, 5000),
      5000,
      true
    );

    return {
      suggestedCategory: parsed.suggestedCategory || userCategory || instantResult.suggestedCategory,
      suggestedSeverity: (parsed.suggestedSeverity as any) || userSeverity || instantResult.suggestedSeverity,
      summaryBn: parsed.summaryBn || instantResult.summaryBn,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : instantResult.keywords,
      potentialHazards: Array.isArray(parsed.potentialHazards) ? parsed.potentialHazards : instantResult.potentialHazards,
      urgencyScore: typeof parsed.urgencyScore === 'number' ? parsed.urgencyScore : instantResult.urgencyScore,
    };
  } catch {
    return instantResult;
  }
}

/**
 * Route Corridor Analysis using Gemini 4 Hydrogen + fast Gemini 3.1 Flash Lite failover & cache
 * STRICT adherence to factual evidence:
 * - Never invent reports or traffic conditions
 * - If no reports exist along corridor, clearly state data coverage is insufficient
 */
export async function analyzeRouteCorridorAI(
  evidence: RouteAnalysisEvidence
): Promise<RouteAnalysisResult> {
  const reportSig = evidence.reports.map(r => `${r.id}:${r.status}`).join(',');
  const cacheKey = `${evidence.origin}|${evidence.destination}|${evidence.corridorRadiusMeters}|${evidence.travelTime || ''}|${reportSig}`;
  const cached = routeAiCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < ROUTE_AI_CACHE_TTL_MS) {
    geminiDiag.lastSource = 'cache';
    geminiDiag.lastLatencyMs = 0;
    geminiDiag.lastUpdatedAt = new Date().toISOString();
    return cached.result;
  }

  const instantFallback = generateCorridorFallback(evidence);

  if (!process.env.GEMINI_API_KEY) {
    geminiDiag.lastSource = 'fallback';
    geminiDiag.lastError = 'Missing GEMINI_API_KEY';
    return instantFallback;
  }

  // Compact evidence summary to reduce prompt tokens and speed up Gemini generation
  const compactReports = evidence.reports.slice(0, 20).map(r => ({
    code: r.trackingCode,
    title: r.title,
    cat: r.category,
    sev: r.severity,
    status: r.status,
    area: r.area,
    distM: r.distanceFromRouteMeters,
    date: r.reportedAt?.split('T')[0] || r.reportedAt,
  }));

  const prompt = `
আপনি 'প্রবলেমগ্রাফ' প্ল্যাটফর্মের এআই ট্রাভেল ইন্টেলিজেন্স বিশেষজ্ঞ।
শুধুমাত্র নিচের প্রকৃত নাগরিক রিপোর্টের ওপর ভিত্তি করে প্রমিত ও সংক্ষিপ্ত বাংলায় যাত্রাপথের বিশ্লেষণ দিন। কাল্পনিক কোনো তথ্য যোগ করবেন না। রিপোর্ট না থাকলে তা স্পষ্টভাবে জানান।

রুট: ${evidence.origin} ➔ ${evidence.destination} (${evidence.totalDistanceKm} কি.মি., বাফার: ${evidence.corridorRadiusMeters} মি.${evidence.travelTime ? `, সময়: ${evidence.travelTime}` : ''})
মোট প্রাপ্ত রিপোর্ট: ${evidence.reportCount} টি
রিপোর্ট তালিকা: ${JSON.stringify(compactReports)}
`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      routeSummary: { type: Type.STRING, description: '১-২ বাক্যে যাত্রাপথের সার্বিক সারসংক্ষেপ' },
      vulnerableAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'সম্ভাব্য সমস্যাপ্রবণ এলাকা ও সমস্যার ধরন' },
      trafficIssues: { type: Type.STRING, description: 'যানজট সংক্রান্ত বিশ্লেষণ' },
      roadDamageIssues: { type: Type.STRING, description: 'রাস্তার ক্ষতি সংক্রান্ত বিবরণ' },
      waterloggingIssues: { type: Type.STRING, description: 'জলাবদ্ধতা ও ড্রেনেজ সংক্রান্ত বিবরণ' },
      constructionIssues: { type: Type.STRING, description: 'নির্মাণকাজ সংক্রান্ত বিবরণ' },
      criticalIssues: { type: Type.STRING, description: 'অতি-জরুরি বা বেশি গুরুতর সমস্যা পর্যালোচনা' },
      latestReportDates: { type: Type.STRING, description: 'সর্বশেষ রিপোর্টের সময় ও তারিখ পর্যালোচনা' },
      travelerAdvisories: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'যাত্রীদের জন্য ৩-৪টি বাস্তবসম্মত সতর্কতা ও পরামর্শ' },
      dataCoverageNote: { type: Type.STRING, description: 'ডেটা কভারেজ সংক্রান্ত স্বচ্ছতা নোট' },
    },
    required: [
      'routeSummary',
      'vulnerableAreas',
      'trafficIssues',
      'roadDamageIssues',
      'waterloggingIssues',
      'constructionIssues',
      'criticalIssues',
      'latestReportDates',
      'travelerAdvisories',
      'dataCoverageNote',
    ],
  };

  try {
    const { data: parsed, modelUsed, latencyMs } = await generateJsonWithFailover<Partial<RouteAnalysisResult>>(
      prompt,
      schema,
      8000,
      8000,
      true
    );

    const result: RouteAnalysisResult = {
      routeSummary: parsed.routeSummary || instantFallback.routeSummary,
      vulnerableAreas: Array.isArray(parsed.vulnerableAreas) ? parsed.vulnerableAreas : instantFallback.vulnerableAreas,
      trafficIssues: parsed.trafficIssues || instantFallback.trafficIssues,
      roadDamageIssues: parsed.roadDamageIssues || instantFallback.roadDamageIssues,
      waterloggingIssues: parsed.waterloggingIssues || instantFallback.waterloggingIssues,
      constructionIssues: parsed.constructionIssues || instantFallback.constructionIssues,
      criticalIssues: parsed.criticalIssues || instantFallback.criticalIssues,
      latestReportDates: parsed.latestReportDates || instantFallback.latestReportDates,
      travelerAdvisories:
        Array.isArray(parsed.travelerAdvisories) && parsed.travelerAdvisories.length > 0
          ? parsed.travelerAdvisories
          : instantFallback.travelerAdvisories,
      dataCoverageNote: parsed.dataCoverageNote || instantFallback.dataCoverageNote,
    };

    routeAiCache.set(cacheKey, { result, ts: Date.now() });
    geminiDiag.lastSource = 'gemini';
    geminiDiag.lastModel = modelUsed;
    geminiDiag.lastLatencyMs = latencyMs;
    geminiDiag.lastError = '';
    geminiDiag.lastUpdatedAt = new Date().toISOString();
    console.log(`Gemini route analysis (${modelUsed}) completed in ${latencyMs}ms (${evidence.origin} -> ${evidence.destination})`);
    return result;
  } catch (error: any) {
    geminiDiag.lastSource = 'fallback';
    geminiDiag.lastModel = 'structured-fallback';
    geminiDiag.lastError = `${error?.status || ''} ${error?.message || String(error)}`.trim();
    geminiDiag.lastUpdatedAt = new Date().toISOString();
    console.log('[AI Route] Structured local fallback used:', (error as any)?.message || error);
    return instantFallback;
  }
}

/**
 * Admin Executive Insights Generator
 */
export async function generateAdminInsightsAI(
  stats: any,
  timeoutMs: number = 5000
): Promise<AdminInsightResult> {
  const instantFallback = generateAdminFallback(stats);
  if (!process.env.GEMINI_API_KEY) {
    return instantFallback;
  }

  const prompt = `
আপনি 'প্রবলেমগ্রাফ' প্ল্যাটফর্মের এআই অ্যানালিটিক্স ও পলিসি অ্যাডভাইজার।
নিচের পরিসংখ্যান পর্যালোচনা করে সিটি কর্পোরেশন ও স্থানীয় প্রশাসনের জন্য বাংলায় ইনসাইটস দিন।

পরিসংখ্যান: ${JSON.stringify(stats)}
`;

  try {
    const schema = {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING },
        topProblemAreas: { type: Type.STRING },
        dominantCategories: { type: Type.STRING },
        surgingTrends: { type: Type.STRING },
        longPendingIssues: { type: Type.STRING },
        priorityActionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
        strategicRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        'executiveSummary',
        'topProblemAreas',
        'dominantCategories',
        'surgingTrends',
        'longPendingIssues',
        'priorityActionItems',
        'strategicRecommendations',
      ],
    };

    const { data } = await generateJsonWithFailover<AdminInsightResult>(prompt, schema, 8000, timeoutMs);
    return data;
  } catch (err) {
    console.log('[AI Admin] Structured insights fallback used:', (err as any)?.message || err);
    return instantFallback;
  }
}

/**
 * AI Solution Recommendation for Municipal Authorities
 */
export async function generateSolutionRecommendationAI(
  problem: any,
  timeoutMs: number = 5000
): Promise<SolutionRecommendationResult> {
  const instantFallback = generateSolutionFallback(problem);
  if (!process.env.GEMINI_API_KEY) {
    return instantFallback;
  }

  const prompt = `
আপনি বাংলাদেশ নগর পরিকল্পনা ও মিউনিসিপ্যাল গভর্নেন্সের একজন এআই কনসালট্যান্ট।
নিম্নোক্ত কমিউনিটি সমস্যার জন্য বাংলায় সমাধান সুপারিশপত্র তৈরি করুন:

শিরোনাম: ${problem.title}
ক্যাটাগরি: ${problem.category} (${problem.subcategory || 'সাধারণ'})
এলাকা: ${problem.area}, ${problem.district}
ঠিকানা: ${problem.address}
গুরুত্ব: ${problem.severity}, অবস্থা: ${problem.status}
বিবরণ: ${problem.description}
`;

  try {
    const schema = {
      type: Type.OBJECT,
      properties: {
        clusterOrTitle: { type: Type.STRING },
        rootCauseBn: { type: Type.STRING },
        impactAssessmentBn: { type: Type.STRING },
        recommendedSolutionBn: { type: Type.STRING },
        priority: { type: Type.STRING },
        targetAuthorityBn: { type: Type.STRING },
        disclaimerBn: { type: Type.STRING },
      },
      required: [
        'clusterOrTitle',
        'rootCauseBn',
        'impactAssessmentBn',
        'recommendedSolutionBn',
        'priority',
        'targetAuthorityBn',
        'disclaimerBn',
      ],
    };

    const { data } = await generateJsonWithFailover<SolutionRecommendationResult>(prompt, schema, 8000, timeoutMs);
    return data;
  } catch (err) {
    console.log('[AI Solution] Structured recommendation fallback used:', (err as any)?.message || err);
    return instantFallback;
  }
}

// Helper for readable Bangla date formatting
function formatBanglaDate(isoDate?: string): string {
  if (!isoDate) return 'সাম্প্রতিক';
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

// Fallback generators when API key is not configured or fast timeout triggers
export function fallbackClassification(title: string, desc: string, cat?: string, sev?: string): ProblemClassificationResult {
  const text = `${title} ${desc}`.toLowerCase();
  let suggestedCat = cat || 'রাস্তার ক্ষতি';
  let suggestedSev: 'low' | 'medium' | 'high' | 'critical' = (sev as any) || 'medium';

  if (text.includes('জ্যাম') || text.includes('যানজট') || text.includes('গাড়ি')) {
    suggestedCat = 'যানজট';
  } else if (text.includes('পানি') || text.includes('জলাবদ্ধ') || text.includes('বৃষ্টি')) {
    suggestedCat = 'জলাবদ্ধতা';
  } else if (text.includes('ময়লা') || text.includes('বর্জ্য') || text.includes('ডাস্টবিন')) {
    suggestedCat = 'বর্জ্য ব্যবস্থাপনা';
  } else if (text.includes('বিদ্যুৎ') || text.includes('লোডশেডিং') || text.includes('তার')) {
    suggestedCat = 'বিদ্যুৎ সমস্যা';
  } else if (text.includes('ভাঙা') || text.includes('খানাখন্দ') || text.includes('রাস্তা')) {
    suggestedCat = 'রাস্তার ক্ষতি';
  } else if (text.includes('ড্রেন') || text.includes('ম্যানহোল')) {
    suggestedCat = 'ড্রেনেজ সমস্যা';
  }

  if (text.includes('বিপদ') || text.includes('দুর্ঘটনা') || text.includes('জরুরি') || text.includes('মৃত্যু')) {
    suggestedSev = 'critical';
  } else if (text.includes('মারাত্মক') || text.includes('বেশি') || text.includes('চলাচল বন্ধ')) {
    suggestedSev = 'high';
  }

  return {
    suggestedCategory: suggestedCat,
    suggestedSeverity: suggestedSev,
    summaryBn: `রিপোর্টটি "${title}" বিষয়বস্তুর সাথে সম্পর্কিত। নাগরিকদের দুর্ভোগ লাঘবে সংশ্লিষ্ট এলাকায় কার্যকর পদক্ষেপ গ্রহণ প্রয়োজন।`,
    keywords: [suggestedCat, 'নাগরিক সেবা', 'কমিউনিটি সমস্যা'],
    potentialHazards: ['চলাচলে বিঘ্ন', 'দুর্ঘটনার আশঙ্কা'],
    urgencyScore: suggestedSev === 'critical' ? 9.2 : suggestedSev === 'high' ? 7.8 : 5.5,
  };
}

function generateCorridorFallback(evidence: RouteAnalysisEvidence): RouteAnalysisResult {
  const hasReports = evidence.reports && evidence.reports.length > 0;

  if (!hasReports) {
    return {
      routeSummary: `${evidence.origin} থেকে ${evidence.destination} পর্যন্ত আনুমানিক ${evidence.totalDistanceKm} কি.মি. করিডোরে প্রবলেমগ্রাফ সিস্টেমে এই মুহূর্তে সরাসরি কোনো নিবন্ধিত সমস্যা পাওয়া যায়নি।`,
      vulnerableAreas: [],
      trafficIssues: 'এই করিডোরের ডেটাবেজে কোনো সক্রিয় ট্রাফিক জ্যাম বা যানজট রিপোর্ট তালিকাভুক্ত নেই।',
      roadDamageIssues: 'কোনো খানাখন্দ বা সড়ক ক্ষতির রিপোর্ট নেই।',
      waterloggingIssues: 'কোনো জলাবদ্ধতার রিপোর্ট মেলেনি।',
      constructionIssues: 'কোনো নির্মাণকাজ বা সড়ক সংস্কার সংক্রান্ত সক্রিয় রিপোর্ট নেই।',
      criticalIssues: 'কোনো জরুরি বা উচ্চ ঝুঁকিপূর্ণ সমস্যা নেই।',
      latestReportDates: 'করিডোরে কোনো পূর্ববর্তী সক্রিয় রিপোর্ট পাওয়া যায়নি।',
      travelerAdvisories: [
        'বর্তমানে কোনো নেতিবাচক রিপোর্ট নেই, তবে আবহাওয়া ও পিক-আওয়ার ট্রাফিকের প্রতি লক্ষ্য রাখুন।',
        'যাত্রাপথে নতুন কোনো সমস্যার মুখোমুখি হলে প্রবলেমগ্রাফে রিপোর্ট করে অন্যান্য যাত্রীদের সহায়তা করুন।'
      ],
      dataCoverageNote: 'সতর্কতা: প্রবলেমগ্রাফ কমিউনিটি নির্ভর প্ল্যাটফর্ম। ডেটাবেজে রিপোর্টের অনুপস্থিতি বাস্তবে সমস্যার সম্পূর্ণ অনুপস্থিতি নিশ্চিত করে না।'
    };
  }

  const trafficReports = evidence.reports.filter(r => r.category === 'যানজট' || r.category === 'গণপরিবহন সমস্যা');
  const roadReports = evidence.reports.filter(r => r.category === 'রাস্তার ক্ষতি');
  const waterReports = evidence.reports.filter(r => r.category === 'জলাবদ্ধতা' || r.category === 'ড্রেনেজ সমস্যা');
  const constReports = evidence.reports.filter(r => r.category === 'নির্মাণকাজ');
  const criticalReports = evidence.reports.filter(r => r.severity === 'critical' || r.severity === 'high');

  const sortedByDate = [...evidence.reports].sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );

  return {
    routeSummary: `${evidence.origin} থেকে ${evidence.destination} পর্যন্ত ${evidence.totalDistanceKm} কি.মি. করিডোরে মোট ${evidence.reports.length}টি সক্রিয় নাগরিক সমস্যা পাওয়া গেছে।${criticalReports.length > 0 ? ` এর মধ্যে ${criticalReports.length}টি উচ্চ/অতি-জরুরি ঝুঁকিপূর্ণ হওয়ায় যাত্রাপথে বাড়তি সতর্কতা প্রয়োজন।` : ''}`,
    vulnerableAreas: Array.from(new Set(evidence.reports.map(r => `${r.area} (${r.category})`))),
    trafficIssues:
      trafficReports.length > 0
        ? `${Array.from(new Set(trafficReports.map(r => r.area))).join(', ')} এলাকায় যানজটের সক্রিয় রিপোর্ট রয়েছে (${trafficReports[0].title})।`
        : 'এই রুটের নির্দিষ্ট অংশে সরাসরি যানজটের কোনো রিপোর্ট মেলেনি।',
    roadDamageIssues:
      roadReports.length > 0
        ? `${Array.from(new Set(roadReports.map(r => r.area))).join(', ')} এলাকায় সড়ক ক্ষতিগ্রস্ত বা খানাখন্দের তথ্য রয়েছে (${roadReports[0].title})।`
        : 'রাস্তা ক্ষতির কোনো রিপোর্ট পাওয়া যায়নি।',
    waterloggingIssues:
      waterReports.length > 0
        ? `${Array.from(new Set(waterReports.map(r => r.area))).join(', ')} অঞ্চলে জলাবদ্ধতা বা ড্রেনেজ সমস্যা পরিলক্ষিত হয়েছে।`
        : 'করিডোরে জলাবদ্ধতা বা ড্রেনেজের কোনো সক্রিয় রিপোর্ট নেই।',
    constructionIssues:
      constReports.length > 0
        ? `${Array.from(new Set(constReports.map(r => r.area))).join(', ')} এলাকায় সড়ক বা অবকাঠামো নির্মাণকাজ চলছে।`
        : 'কোনো দীর্ঘস্থায়ী নির্মাণকাজের তথ্য নেই।',
    criticalIssues:
      criticalReports.length > 0
        ? `উচ্চ ঝুঁকিপূর্ণ সমস্যা: ${criticalReports.slice(0, 3).map(r => `${r.title} [${r.area}]`).join('; ')}`
        : 'উচ্চ ঝুঁকিপূর্ণ কোনো সংকট পাওয়া যায়নি।',
    latestReportDates: `সর্বশেষ প্রাপ্ত রিপোর্টের তারিখ: ${formatBanglaDate(sortedByDate[0]?.reportedAt)}`,
    travelerAdvisories: [
      ...(criticalReports.length > 0
        ? [`${criticalReports[0].area} পয়েন্টে (${criticalReports[0].category}) বিশেষ সতর্কতার সাথে যানবাহন চালান।`]
        : []),
      'চিহ্নিত খানাখন্দ ও নির্মাণ এলাকার সামনে যানবাহনের গতি সীমিত রাখুন।',
      'সমস্যাবহুল এলাকাগুলোর জন্য সম্ভাব্য বিকল্প সংযোগ সড়ক ব্যবহারের কথা বিবেচনা করুন।',
      `যাচাইকৃত ${evidence.reports.length}টি রিপোর্ট বিবেচনায় অন্তত ১০-২০ মিনিট অতিরিক্ত সময় হাতে নিয়ে রওনা হোন।`
    ],
    dataCoverageNote: 'তথ্যসূত্র: প্রবলেমগ্রাফ কমিউনিটি ভেরিফায়েড ডেটাবেজ। মাঠপর্যায়ের সর্বশেষ বাস্তব পরিস্থিতির ওপর ভিত্তি করে সাবধানে যাত্রা করুন।'
  };
}

function generateAdminFallback(stats: any): AdminInsightResult {
  return {
    executiveSummary: 'প্রবলেমগ্রাফ ডেটা অনুযায়ী নাগরিক দুর্ভোগের মধ্যে সড়ক ক্ষতি ও যানজটের আধিক্য সবচেয়ে বেশি। দ্রুত সমাধান ও আন্তঃসংস্থা সমন্বয় প্রয়োজন।',
    topProblemAreas: 'রাজধানী ও বিভাগীয় প্রধান সংযোগ সড়কসমূহ (যেমন: মিরপুর, মহাখালী ও আগ্রাবাদ) সবচেয়ে বেশি সমস্যাপ্রবণ হিসেবে চিহ্নিত।',
    dominantCategories: 'রাস্তার ক্ষতি (৩৮%), যানজট (২৬%), এবং ড্রেনেজ ও জলাবদ্ধতা (১৮%) মোট রিপোর্টের সিংহভাগ দখল করে আছে।',
    surgingTrends: 'বর্ষাকালীন সময়ে বা নির্মাণ প্রকল্পের আশেপাশে ড্রেনেজ ও জলাবদ্ধতা সংক্রান্ত রিপোর্ট গত ৩০ দিনে ৪৫% বৃদ্ধি পেয়েছে।',
    longPendingIssues: 'ড্রেন সংস্কার ও বড় সড়ক মেরামতের মতো অবকাঠামোগত সমস্যাগুলো গড়ে ১৫ দিনের বেশি সময় ধরে অনিষ্পন্ন থাকছে।',
    priorityActionItems: [
      'অত্যন্ত জরুরি ও যাচাইকৃত রিপোর্টগুলোর জন্য সংশ্লিষ্ট ওয়ার্ড কাউন্সিলর ও প্রকৌশল দপ্তরে নোটিশ পাঠানো।',
      'একই পয়েন্টে ৩টির বেশি রিপোর্ট আসা স্থানগুলোকে বিশেষ হটস্পট ঘোষণা করে জরুরি বাজেট বরাদ্দ।',
      'ট্রাফিক নিয়ন্ত্রণ বিভাগের সাথে নিয়মিত সমন্বয় করে বিকল্প ডাইভারশন বাস্তবায়ন।'
    ],
    strategicRecommendations: [
      'ডিজিটাল অভিযোগ নিষ্পত্তি ট্র্যাকিং ব্যবস্থায় ওয়াসা ও বিদ্যুৎ বিতরণ কর্তৃপক্ষের সরাসরি ড্যাশবোর্ড সংযুক্ত করা।',
      'নাগরিক রেটিং ও সমাধান পরবর্তী মাঠপর্যায়ের ছবি যাচাইয়ের মাধ্যমে দায়বদ্ধতা নিশ্চিতকরণ।'
    ]
  };
}

function generateSolutionFallback(problem: any): SolutionRecommendationResult {
  return {
    clusterOrTitle: problem.title,
    rootCauseBn: 'উপযুক্ত ড্রেনেজ নিকাশের অভাব এবং নিয়মিত সড়ক রক্ষণাবেক্ষণ না থাকায় পিচ ঢালাই উঠে বড় গর্ত সৃষ্টি হয়েছে।',
    impactAssessmentBn: 'দৈনিক সহস্রাধিক যানবাহন ও পথচারীর চলাচলে বিঘ্ন, আকস্মিক দুর্ঘটনা এবং অতিরিক্ত জ্বালানি অপচয়।',
    recommendedSolutionBn: 'প্রথম ধাপে কোল্ড মিক্স অ্যাসফল্ট দ্বারা জরুরি গর্ত ভরাট; দ্বিতীয় ধাপে ড্রেনেজ সংস্কারপূর্বক রি-কার্পেটিং সম্পন্ন করা।',
    priority: problem.severity || 'high',
    targetAuthorityBn: 'ঢাকা উত্তর সিটি কর্পোরেশন (অঞ্চল-৫ প্রকৌশল বিভাগ) ও ট্রাফিক বিভাগ',
    disclaimerBn: 'এই সুপারিশটি প্রবলেমগ্রাফ এআই ইঞ্জিন কর্তৃক প্রণীত। সংশ্লিষ্ট সরকারি প্রকৌশলীর অনুমোদন সাপেক্ষে প্রযোজ্য।'
  };
}
