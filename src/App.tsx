import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Sparkles, FileText, BarChart3, Bookmark, Download, Copy, Trash2, 
  CheckCircle2, ChevronRight, RefreshCw, Zap, TrendingUp, ShieldAlert,
  Sliders, Layers, Eye, Globe, Share2, Printer, ArrowRight,
  Target, Award, Lightbulb, Compass, Filter, BookOpen, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell
} from 'recharts';

interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface Recommendation {
  phase: string;
  title: string;
  action: string;
  impact?: string;
}

interface MarketMetrics {
  currentMarketSize: string;
  cagr: string;
  forecastPeriod: string;
  projectedMarketSize: string;
}

interface ChartYearData {
  year: string;
  value: number | null;
  forecast: number;
}

interface RadarItem {
  subject: string;
  Us: number;
  CompetitorA: number;
  CompetitorB: number;
}

interface SwotMetricItem {
  name: string;
  score: number;
  fill: string;
}

interface ReportData {
  id: string;
  title: string;
  topic: string;
  industry: string;
  template: string;
  tone: string;
  execSummary: string;
  keyFindings: string[];
  swotData: SWOTData;
  marketAnalysis: string;
  marketMetrics?: MarketMetrics;
  marketGrowthChart?: ChartYearData[];
  competitorRadar?: RadarItem[];
  swotMetrics?: SwotMetricItem[];
  riskAssessment: string[];
  recommendations: Recommendation[];
  fullMarkdown: string;
  createdAt: string;
}

const REPORT_TEMPLATES = [
  {
    id: 'swot',
    title: 'SWOT Analysis (การวิเคราะห์จุดแข็ง จุดอ่อน โอกาส อุปสรรค)',
    description: 'ประเมินปัจจัยภายในและภายนอกองค์กรอย่างเป็นระบบ เพื่อกำหนดทิศทางเชิงกลยุทธ์',
    icon: Sliders,
    badge: 'กลยุทธ์หลัก',
    promptTemplate: 'ทำการวิเคราะห์ SWOT เชิงลึก โดยระบุ 4-5 ประเด็นสำคัญต่อหมวด พร้อมข้อเสนอแนะเชิงกลยุทธ์ที่นำไปปฏิบัติได้จริง'
  },
  {
    id: 'market_entry',
    title: 'Market Entry Strategy (กลยุทธ์การเจาะตลาดใหม่)',
    description: 'วิเคราะห์โอกาส ขนาดตลาด (TAM/SAM/SOM) อุปสรรคการเข้าสู่ตลาด และกลยุทธ์ Go-to-Market',
    icon: TrendingUp,
    badge: 'ขยายธุรกิจ',
    promptTemplate: 'ประเมินกลยุทธ์การเข้าสู่ตลาด (Market Entry) รวมถึงขนาดตลาด อุปสรรคการเข้าถึง และกลยุทธ์เจาะตลาดเป้าหมาย'
  },
  {
    id: 'competitor',
    title: 'Competitive Analysis (การวิเคราะห์คู่แข่งเปรียบเทียบ)',
    description: 'เปรียบเทียบจุดเด่น จุดด้อย ส่วนแบ่งตลาด และตำแหน่งทางการตลาดของผู้เล่นสำคัญ',
    icon: Briefcase,
    badge: 'แข่งขัน',
    promptTemplate: 'วิเคราะห์และเปรียบเทียบคู่แข่งหลักในตลาด ทั้งในด้านจุดเด่น จุดด้อย ส่วนแบ่งตลาด นวัตกรรม และราคา'
  },
  {
    id: 'pestel',
    title: 'PESTEL Analysis (วิเคราะห์ปัจจัยแวดล้อมเชิงมหภาค)',
    description: 'วิเคราะห์ปัจจัยด้านการเมือง เศรษฐกิจ สังคม เทคโนโลยี สิ่งแวดล้อม และกฎหมาย',
    icon: Globe,
    badge: 'ภาพรวมมหภาค',
    promptTemplate: 'ทำ PESTEL Analysis วิเคราะห์ปัจจัยแวดล้อมภายนอกระดับมหภาคที่ส่งผลต่ออุตสาหกรรมในปัจจุบันและอนาคต'
  },
  {
    id: 'trend_innovation',
    title: 'Trend & Innovation Report (รายงานเทรนด์และนวัตกรรมใหม่)',
    description: 'สรุปแนวโน้มตลาด นวัตกรรมเปลี่ยนเกม และพฤติกรรมผู้บริโภคที่กำลังเปลี่ยนไปใน 3-5 ปีข้างหน้า',
    icon: Zap,
    badge: 'เทรนด์อนาคต',
    promptTemplate: 'สรุปแนวโน้มเทคโนโลยี นวัตกรรมใหม่ และพฤติกรรมผู้บริโภคที่กำลังเปลี่ยนไป พร้อมโอกาสทางธุรกิจ'
  },
  {
    id: 'blue_ocean',
    title: 'Blue Ocean Strategy (กลยุทธ์น่านน้ำสีคราม)',
    description: 'วิเคราะห์การสร้างคุณค่าใหม่ ลดต้นทุน และหลีกเลี่ยงการแข่งขันทางราคาในตลาดเดิม',
    icon: Compass,
    badge: 'นวัตกรรมคุณค่า',
    promptTemplate: 'วิเคราะห์กลยุทธ์ Blue Ocean มุ่งเน้นการสร้างคุณค่าใหม่และการสร้างความต้องการที่ไม่เคยมีมาก่อน (Value Innovation)'
  }
];

const TONE_OPTIONS = [
  { id: 'executive', name: 'ทางการระดับบริหาร (Executive / Formal)', desc: 'กระชับ สรุปประเด็นชัดเจน เหมาะสำหรับบอร์ดบริหารและผู้นำองค์กร' },
  { id: 'strategic', name: 'เชิงกลยุทธ์และวิเคราะห์ (Strategic & Analytical)', desc: 'เน้นข้อมูลเชิงลึก มีเหตุและผล พร้อมแนวทางปฏิบัติจริง' },
  { id: 'pitch', name: 'สไตล์ Pitch Deck / กระตุ้นการลงทุน', desc: 'เน้นวิสัยทัศน์ โอกาสเติบโต และความคุ้มค่าของการลงทุน' },
  { id: 'academic', name: 'วิชาการและวิจัยเชิงลึก (Academic & Research)', desc: 'ละเอียด ถี่ถ้วน มีโครงสร้างชัดเจนตามระเบียบวิธีวิจัย' }
];

const SAMPLE_PRESETS = [
  {
    topic: 'ร้านกาแฟพิเศษทางเลือกสุขภาพ (Specialty & Healthy Cafe)',
    industry: 'อาหารและเครื่องดื่มเพื่อสุขภาพ (F&B Wellness)',
    competitors: 'Starbucks, Cafe Amazon, Pacamara, ร้านกาแฟ Local Specialty',
    specificQuestions: 'เจาะกลุ่มคนทำงาน Gen Z และ Millennials ที่ใส่ใจเรื่องสุขภาพ ต้องการกลยุทธ์ราคาและการสร้าง Brand Loyalty',
    template: 'swot',
    tone: 'strategic'
  },
  {
    topic: 'แอปพลิเคชันวางแผนการเงินและภาษีส่วนบุคคล (Smart Wealth & Tax App)',
    industry: 'เทคโนโลยีการเงิน (FinTech & Personal Finance)',
    competitors: 'FinTech Apps ในไทย, สถาบันการเงินดั้งเดิม, Excel Templates',
    specificQuestions: 'วิเคราะห์โอกาสการเติบโตหลังกฎหมายภาษีอัปเดต และโมเดลรายได้แบบ Freemium + Subscription',
    template: 'market_entry',
    tone: 'pitch'
  },
  {
    topic: 'ธุรกิจอาหารและโภชนาการสัตว์เลี้ยงเกรดพรีเมียม (Human-Grade Pet Food)',
    industry: 'ธุรกิจสัตว์เลี้ยง (Pet Economy & Care)',
    competitors: 'Royal Canin, Hill\'s Science Diet, อาหารสัตว์นำเข้าจากยุโรป',
    specificQuestions: 'กระแส Pet Humanization ในไทย และโอกาสการสร้างแบรนด์ที่ผลิตวัตถุดิบในประเทศ',
    template: 'trend_innovation',
    tone: 'strategic'
  },
  {
    topic: 'บริการติดตั้งโซลาร์รูฟท็อปและระบบกักเก็บพลังงานสำหรับบ้านพักอาศัย',
    industry: 'พลังงานหมุนเวียนและ Green Tech',
    competitors: 'ผู้รับเหมารายย่อย, บริษัทพลังงานรายใหญ่',
    specificQuestions: 'ระยะเวลาคืนทุน (Payback Period) และความกังวลของผู้บริโภคเรื่องการดูแลรักษา',
    template: 'competitor',
    tone: 'executive'
  }
];

const DEFAULT_SAMPLE_REPORT: ReportData = {
  id: 'sample-001',
  title: 'รายงานวิจัยและวิเคราะห์เชิงกลยุทธ์: ธุรกิจร้านกาแฟพิเศษทางเลือกสุขภาพ (Specialty & Healthy Cafe)',
  topic: 'ร้านกาแฟพิเศษทางเลือกสุขภาพ (Specialty & Healthy Cafe)',
  industry: 'อาหารและเครื่องดื่มเพื่อสุขภาพ (F&B Wellness)',
  template: 'swot',
  tone: 'strategic',
  execSummary: 'รายงานฉบับนี้ทำการวิเคราะห์โอกาสทางธุรกิจและความท้าทายของ "ร้านกาแฟพิเศษทางเลือกสุขภาพ" ในประเทศไทย ท่ามกลางกระแสการบริโภคกาแฟคุณภาพสูงควบคู่กับการใส่ใจสุขภาพ โดยตลาดกาแฟ Specialty ในไทยเติบโตอย่างต่อเนื่องเฉลี่ย 14.5% ต่อปี\n\nจากการสังเคราะห์ข้อมูลพบว่า ผู้บริโภคกลุ่มคนทำงานยุคใหม่ยินดีจ่ายในราคาสูงขึ้นหากผลิตภัณฑ์มีส่วนผสมทางเลือกที่ชัดเจน (เช่น นมพืชทางเลือก เมล็ดกาแฟออร์แกนิก สารให้ความหวานจากธรรมชาติ) กลยุทธ์สำคัญที่แนะนำคือการสร้างความแตกต่างผ่าน Storytelling แหล่งปลูก และการพัฒนาคอมมูนิตี้ลูกค้าประจำ',
  keyFindings: [
    'ตลาดกาแฟพิเศษและเครื่องดื่มสุขภาพในไทยมีมูลค่าทะลุ 18,500 ล้านบาท พร้อมการเติบโตแบบทวีคูณในกลุ่มหัวเมืองใหญ่',
    'ผู้บริโภคกว่า 68% มีความสนใจเครื่องดื่มที่ไม่ใส่น้ำตาลทราย และ 45% นิยมใช้นมจากพืช เช่น นมข้าวโอ๊ต และนมอัลมอนด์',
    'การแข่งขันในกลุ่มราคาปานกลางค่อนข้างดุเดือด แต่ยังมีช่องว่างในกลุ่ม "กาแฟฟังก์ชันนัล" (เช่น ผสมวิตามิน สมุนไพร หรือคอลลาเจน)',
    'ระบบสมาชิกและโปรแกรม Loyalty บนดิจิทัลช่วยเพิ่มอัตราการซื้อซ้ำ (Repeat Purchase) สูงถึง 35%'
  ],
  swotData: {
    strengths: [
      'ความเชี่ยวชาญด้านการคัดสรรเมล็ดกาแฟคุณภาพสูงและสูตรเครื่องดื่มเพื่อสุขภาพที่เป็นเอกลักษณ์',
      'ความคล่องตัวในการปรับเมนูตามเทรนด์สุขภาพของผู้บริโภคได้อย่างรวดเร็ว',
      'บรรยากาศร้านที่ตอบโจทย์ไลฟ์สไตล์การทำงานและการผ่อนคลาย (Work & Chill Space)',
      'ความโปร่งใสในข้อมูลโภชนาการและแหล่งที่มาของวัตถุดิบ (Traceability)'
    ],
    weaknesses: [
      'ต้นทุนวัตถุดิบพรีเมียมและนมพืชทางเลือกที่สูงกว่าร้านกาแฟทั่วไป 20-30%',
      'การรับรู้แบรนด์ยังจำกัดเฉพาะกลุ่มผู้ชื่นชอบกาแฟในย่านใกล้เคียง',
      'ความท้าทายในการควบคุมมาตรฐานรสชาติและการบริการหากขยายสาขา'
    ],
    opportunities: [
      'กระแส Health & Wellness ที่เติบโตอย่างต่อเนื่องหลังยุคโควิด-19',
      'การต่อยอดผลิตภัณฑ์สูตรสำเร็จแบบ Ready-to-Drink (RTD) หรือ Cold Brew ขวดส่งเดลิเวอรี่',
      'การร่วมมือกับฟิตเนส สตูดิโอโยคะ หรือคอมมูนิตี้รักสุขภาพเพื่อขยายฐานลูกค้า',
      'การจำหน่ายเมล็ดกาแฟคั่วและอุปกรณ์ชงกาแฟสำหรับดื่มที่บ้าน (Home Brewing)'
    ],
    threats: [
      'เชนกาแฟรายใหญ่เริ่มหันมาเพิ่มตัวเลือกนมพืชและเมนูกาแฟสุขภาพด้วยงบการตลาดมหาศาล',
      'ความผันผวนของราคาเมล็ดกาแฟดิบและต้นทุนค่าเช่าพื้นที่ในทำเลเศรษฐกิจ',
      'กำลังซื้อของผู้บริโภคที่อาจชะลอตัวจากภาวะเศรษฐกิจภาพรวม'
    ]
  },
  marketAnalysis: 'ตลาดกาแฟในประเทศไทยแบ่งเป็น 3 กลุ่มหลัก ได้แก่ กาแฟสำเร็จรูป (Mass), เชนร้านกาแฟเชิงพาณิชย์ (Commercial Chains), และร้านกาแฟพิเศษ (Specialty Coffee) โดยกลุ่ม Specialty มีอัตราการเติบโตสูงที่สุดอย่างต่อเนื่อง ผู้บริโภคปัจจุบันมองหากาแฟที่ไม่ใช่แค่ตัวช่วยกระตุ้นความตื่นตัว แต่เป็นส่วนหนึ่งของรสนิยม สุนทรียะ และการดูแลสุขภาพในระยะยาว',
  marketMetrics: {
    currentMarketSize: '18,500 ล้านบาท',
    cagr: '+14.5% ต่อปี',
    forecastPeriod: '2024 - 2028',
    projectedMarketSize: '32,000 ล้านบาท'
  },
  marketGrowthChart: [
    { year: '2023', value: 135, forecast: 135 },
    { year: '2024', value: 165, forecast: 165 },
    { year: '2025', value: 205, forecast: 210 },
    { year: '2026', value: null, forecast: 260 },
    { year: '2027', value: null, forecast: 335 },
    { year: '2028', value: null, forecast: 425 }
  ],
  competitorRadar: [
    { subject: 'นวัตกรรมสุขภาพ', Us: 95, CompetitorA: 65, CompetitorB: 60 },
    { subject: 'คุณภาพเมล็ดกาแฟ', Us: 92, CompetitorA: 80, CompetitorB: 70 },
    { subject: 'ความพึงพอใจลูกค้า', Us: 90, CompetitorA: 78, CompetitorB: 75 },
    { subject: 'การรับรู้แบรนด์', Us: 65, CompetitorA: 96, CompetitorB: 88 },
    { subject: 'ความคุ้มค่าราคา', Us: 82, CompetitorA: 65, CompetitorB: 85 }
  ],
  swotMetrics: [
    { name: 'จุดแข็ง (Strengths)', score: 88, fill: '#10B981' },
    { name: 'จุดอ่อน (Weaknesses)', score: 44, fill: '#F59E0B' },
    { name: 'โอกาส (Opportunities)', score: 92, fill: '#3B82F6' },
    { name: 'อุปสรรค (Threats)', score: 48, fill: '#EF4444' }
  ],
  riskAssessment: [
    'ความเสี่ยงด้านต้นทุนเมล็ดกาแฟผันผวน: ทำสัญญาซื้อขายล่วงหน้า (Forward Contract) ร่วมกับวิสาหกิจชุมชนเกษตรกร',
    'ความเสี่ยงจากการเลียนแบบเมนู: จดสิทธิบัตรเครื่องหมายการค้า และสร้างความผูกพันกับลูกค้าผ่านประสบการณ์บริการ',
    'ความเสี่ยงด้านอัตราการหมุนเวียนพนักงาน: จัดฝึกอบรมทักษะ Barista มาตรฐานสากล พร้อมแผนผลตอบแทนจูงใจ'
  ],
  recommendations: [
    {
      phase: 'ระยะสั้น (0 - 6 เดือน)',
      title: 'สร้าง Brand Signature & ชุมชนคนรักสุขภาพ',
      action: 'เปิดตัวเมนูไฮไลต์ 3 เมนูหลักที่มีข้อมูลแคลอรีและสารอาหารครบถ้วน พร้อมจัดกิจกรรมชิมกาแฟ (Cupping Workshop)',
      impact: 'สูง'
    },
    {
      phase: 'ระยะกลาง (6 - 18 เดือน)',
      title: 'พัฒนาระบบสมาชิกดิจิทัลและบริการจัดส่งถึงที่ทำงาน',
      action: 'เปิดระบบ Subscription สั่งกาแฟรายสัปดาห์สำหรับกลุ่มออฟฟิศ พร้อมสะสมแต้มแลกเครื่องดื่มและสิทธิประโยชน์',
      impact: 'สูง'
    },
    {
      phase: 'ระยะยาว (18 - 36 เดือน)',
      title: 'ขยายไลน์ผลิตภัณฑ์ Ready-to-Drink และสาขาย่อย',
      action: 'ผลิตกาแฟสกัดเย็นบรรจุขวดวางจำหน่ายในซูเปอร์มาร์เก็ตพรีเมียม และเปิด Kiosk ในอาคารสำนักงานเกรด A',
      impact: 'ปานกลาง'
    }
  ],
  fullMarkdown: '',
  createdAt: '5 ต.ค. 2026, 14:30 น.'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'editor' | 'history' | 'presets'>('generator');

  // Input states
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [specificQuestions, setSpecificQuestions] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('swot');
  const [selectedTone, setSelectedTone] = useState('strategic');

  // Process status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // Active Report
  const [currentReport, setCurrentReport] = useState<ReportData>(DEFAULT_SAMPLE_REPORT);
  const [savedReports, setSavedReports] = useState<ReportData[]>([]);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load saved reports
  useEffect(() => {
    try {
      const stored = localStorage.getItem('biz_research_reports_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedReports(parsed);
      } else {
        // Initialize with default sample
        setSavedReports([DEFAULT_SAMPLE_REPORT]);
        localStorage.setItem('biz_research_reports_v2', JSON.stringify([DEFAULT_SAMPLE_REPORT]));
      }
    } catch (e) {
      console.error('Failed to load saved reports', e);
    }
  }, []);

  const saveReportsToStorage = (list: ReportData[]) => {
    try {
      setSavedReports(list);
      localStorage.setItem('biz_research_reports_v2', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist reports', e);
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setTopic(preset.topic);
    setIndustry(preset.industry);
    setCompetitors(preset.competitors);
    setSpecificQuestions(preset.specificQuestions);
    setSelectedTemplate(preset.template);
    setSelectedTone(preset.tone);
    setActiveTab('generator');
  };

  const handleGenerateResearch = async () => {
    if (!topic.trim()) {
      alert('กรุณากรอก "หัวข้อวิจัย / ชื่อธุรกิจ หรือผลิตภัณฑ์" เพื่อให้ระบบสามารถวิเคราะห์ข้อมูลได้');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('กำลังรวบรวมข้อมูลอุตสาหกรรมและพฤติกรรมตลาด...');

    const activeTemp = REPORT_TEMPLATES.find(t => t.id === selectedTemplate);
    const selectedToneObj = TONE_OPTIONS.find(t => t.id === selectedTone);

    try {
      setGenerationProgress('ส่งข้อมูลให้ AI วิเคราะห์โครงสร้างกลยุทธ์เชิงลึก...');

      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          industry,
          competitors,
          specificQuestions,
          templateTitle: activeTemp?.title,
          templatePrompt: activeTemp?.promptTemplate,
          toneName: selectedToneObj?.name,
        }),
      });

      if (!response.ok) {
        throw new Error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }

      const resultData = await response.json();

      const fullMd = compileReportToMarkdown(resultData, topic);

      const newReport: ReportData = {
        id: Date.now().toString(),
        title: resultData.reportTitle || `รายงานวิเคราะห์ธุรกิจ: ${topic}`,
        topic,
        industry: industry || 'ทั่วไป',
        template: selectedTemplate,
        tone: selectedTone,
        execSummary: resultData.execSummary || '',
        keyFindings: resultData.keyFindings || [],
        swotData: resultData.swotData || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        marketAnalysis: resultData.marketAnalysis || '',
        marketMetrics: resultData.marketMetrics,
        marketGrowthChart: resultData.marketGrowthChart,
        competitorRadar: resultData.competitorRadar,
        swotMetrics: resultData.swotMetrics,
        riskAssessment: resultData.riskAssessment || [],
        recommendations: resultData.recommendations || [],
        fullMarkdown: fullMd,
        createdAt: new Date().toLocaleDateString('th-TH', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      setCurrentReport(newReport);
      const updated = [newReport, ...savedReports.filter(r => r.id !== newReport.id)];
      saveReportsToStorage(updated);

      setActiveTab('editor');
    } catch (err: any) {
      console.error('Research error:', err);
      alert('ไม่สามารถประมวลผลงานวิจัยได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const compileReportToMarkdown = (data: any, originalTopic: string) => {
    return `# ${data.reportTitle || `รายงานวิเคราะห์เชิงกลยุทธ์: ${originalTopic}`}

## 1. บทสรุปสำหรับผู้บริหาร (Executive Summary)
${data.execSummary || ''}

---

## 2. ข้อค้นพบสำคัญ (Key Findings)
${(data.keyFindings || []).map((k: string) => `- ${k}`).join('\n')}

---

## 3. การวิเคราะห์ SWOT (SWOT Analysis Matrix)
### 🟢 จุดแข็ง (Strengths)
${(data.swotData?.strengths || []).map((s: string) => `- ${s}`).join('\n')}

### 🟡 จุดอ่อน (Weaknesses)
${(data.swotData?.weaknesses || []).map((w: string) => `- ${w}`).join('\n')}

### 🔵 โอกาส (Opportunities)
${(data.swotData?.opportunities || []).map((o: string) => `- ${o}`).join('\n')}

### 🔴 อุปสรรคและความเสี่ยง (Threats)
${(data.swotData?.threats || []).map((t: string) => `- ${t}`).join('\n')}

---

## 4. ภาพรวมตลาดและการแข่งขัน (Market Dynamics)
${data.marketAnalysis || ''}

${data.marketMetrics ? `
### ตัวชี้วัดสำคัญของตลาด:
- ขนาดตลาดปัจจุบัน: ${data.marketMetrics.currentMarketSize}
- อัตราเติบโตเฉลี่ย (CAGR): ${data.marketMetrics.cagr}
- ระยะเวลาคาดการณ์: ${data.marketMetrics.forecastPeriod}
- คาดการณ์ขนาดตลาด: ${data.marketMetrics.projectedMarketSize}
` : ''}

---

## 5. การประเมินความเสี่ยงและมาตรการรับมือ (Risk Assessment & Mitigation)
${(data.riskAssessment || []).map((r: string) => `- ${r}`).join('\n')}

---

## 6. แผนกลยุทธ์และการลงมือปฏิบัติ (Strategic Recommendations)
${(data.recommendations || []).map((rec: any, i: number) => {
  if (typeof rec === 'string') return `${i + 1}. ${rec}`;
  return `### ${rec.phase}: ${rec.title} (ผลกระทบ: ${rec.impact || 'สูง'})
${rec.action}`;
}).join('\n\n')}
`;
  };

  const handleCopyReport = () => {
    const textToCopy = currentReport.fullMarkdown || compileReportToMarkdown(currentReport, currentReport.topic);
    navigator.clipboard.writeText(textToCopy);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2200);
  };

  const handleDownloadMarkdown = () => {
    const textToDownload = currentReport.fullMarkdown || compileReportToMarkdown(currentReport, currentReport.topic);
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentReport.title || 'business_report'}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentReport.title || 'business_report'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบรายงานนี้ออกจากคลังใช่หรือไม่?')) {
      const filtered = savedReports.filter(r => r.id !== id);
      saveReportsToStorage(filtered);
    }
  };

  const filteredHistory = savedReports.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.industry && item.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-100 tracking-tight">BizResearch AI</span>
                <span className="text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  ระบบวิเคราะห์ธุรกิจภาษาไทย
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">สังเคราะห์ข้อมูลตลาด กลยุทธ์การแข่งขัน และแผนธุรกิจอัจฉริยะ</p>
            </div>
          </div>

          {/* Tab Navigation Controls */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>สร้างงานวิจัย</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer relative ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>รายงานและชาร์ต</span>
              {currentReport.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer hidden md:flex ${
                activeTab === 'presets'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ตัวอย่างกรณีศึกษา</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>คลังรายงาน ({savedReports.length})</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* TAB 1: RESEARCH GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6">

            {/* Quick Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Business Intelligence & Strategic Planning</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  จัดทำบทวิเคราะห์ธุรกิจ วิจัยตลาด และกำหนดกลยุทธ์แข่งขัน
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  เพียงระบุหัวข้อธุรกิจที่คุณสนใจ ระบบจะช่วยประเมิน SWOT, PESTEL, กลยุทธ์เจาะตลาด และจัดทำชาร์ตเปรียบเทียบเชิงปริมาณพร้อมแผนปฏิบัติการทันที
                </p>

                {/* Quick Presets Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    ลองเลือกตัวอย่างเร็ว:
                  </span>
                  {SAMPLE_PRESETS.slice(0, 3).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(item)}
                      className="text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      {item.topic.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form & Templates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Input Panel */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4 text-cyan-400" />
                    ข้อมูลธุรกิจและตลาดเป้าหมาย
                  </h3>

                  <div className="space-y-4">
                    {/* Topic */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        หัวข้อวิจัย / ชื่อธุรกิจ หรือผลิตภัณฑ์ <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="เช่น: ธุรกิจร้านกาแฟพิเศษทางเลือกสุขภาพ, แพลตฟอร์ม EdTech เรียนออนไลน์"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    {/* Industry & Competitors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          อุตสาหกรรม / ตลาดเป้าหมาย
                        </label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="เช่น: F&B สุขภาพ, FinTech, พลังงานสะอาด"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          คู่แข่งสำคัญในตลาด
                        </label>
                        <input
                          type="text"
                          value={competitors}
                          onChange={(e) => setCompetitors(e.target.value)}
                          placeholder="เช่น: แบรนด์ A, แบรนด์ B, ผู้นำตลาด"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Specific Questions */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ประเด็นที่ต้องการให้เน้นเป็นพิเศษ
                      </label>
                      <textarea
                        value={specificQuestions}
                        onChange={(e) => setSpecificQuestions(e.target.value)}
                        rows={2}
                        placeholder="เช่น: ต้องการเน้นกลยุทธ์การตั้งราคา การสร้างฐานลูกค้าประจำ หรือมาตรการลดต้นทุน"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                      />
                    </div>

                    {/* Tone Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        สไตล์และโทนของรายงาน
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {TONE_OPTIONS.map((tone) => (
                          <div
                            key={tone.id}
                            onClick={() => setSelectedTone(tone.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              selectedTone === tone.id
                                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                                : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-semibold text-xs text-slate-200">{tone.name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tone.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleGenerateResearch}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>{generationProgress || 'กำลังวิเคราะห์ข้อมูล...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>เริ่มการวิจัยและสร้างรายงานธุรกิจ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Selection Panel */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    เลือกกรอบการวิเคราะห์ (Framework)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    เลือกเครื่องมือทางกลยุทธ์ที่ตอบโจทย์วัตถุประสงค์ของคุณ
                  </p>

                  <div className="space-y-3">
                    {REPORT_TEMPLATES.map((tmpl) => {
                      const IconComponent = tmpl.icon;
                      const isSelected = selectedTemplate === tmpl.id;

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500 shadow-md'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-200">{tmpl.title}</h4>
                                <span className="inline-block mt-0.5 text-[10px] bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-md border border-slate-700">
                                  {tmpl.badge}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: REPORT & VISUALS */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            
            {/* Action Bar Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-md">
                    {currentReport.template?.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    สร้างเมื่อ: {currentReport.createdAt}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
                  {currentReport.title}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                  title="คัดลอกเนื้อหารายงานทั้งหมด"
                >
                  {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStatus ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                  title="บันทึกไฟล์ Markdown"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>บันทึก .MD</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                  title="บันทึกไฟล์ JSON"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>บันทึก .JSON</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-md shadow-cyan-500/20"
                  title="พิมพ์รายงานหรือบันทึกเป็น PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>พิมพ์ / บันทึก PDF</span>
                </button>
              </div>
            </div>

            {/* Market Metrics Highlights */}
            {currentReport.marketMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 block mb-1">ขนาดตลาดปัจจุบัน</span>
                  <div className="text-base sm:text-lg font-bold text-cyan-400">{currentReport.marketMetrics.currentMarketSize}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 block mb-1">อัตราเติบโตเฉลี่ย (CAGR)</span>
                  <div className="text-base sm:text-lg font-bold text-emerald-400">{currentReport.marketMetrics.cagr}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 block mb-1">ระยะเวลาประเมิน</span>
                  <div className="text-base sm:text-lg font-bold text-slate-200">{currentReport.marketMetrics.forecastPeriod}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-[11px] text-slate-400 block mb-1">คาดการณ์ขนาดตลาด</span>
                  <div className="text-base sm:text-lg font-bold text-indigo-400">{currentReport.marketMetrics.projectedMarketSize}</div>
                </div>
              </div>
            )}

            {/* Interactive Visualizations Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Market Growth Forecast */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    แนวโน้มและประมาณการการเติบโต
                  </h4>
                  <span className="text-[10px] text-slate-400">ดัชนีการเติบโต</span>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentReport.marketGrowthChart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Line type="monotone" dataKey="value" name="มูลค่าจริง" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="forecast" name="ประมาณการ" stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Competitor Radar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    การเปรียบเทียบมิติการแข่งขัน (Radar)
                  </h4>
                  <span className="text-[10px] text-slate-400">เต็ม 100</span>
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={currentReport.competitorRadar || []}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                      <Radar name="ธุรกิจของเรา" dataKey="Us" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.35} />
                      <Radar name="คู่แข่งหลัก" dataKey="CompetitorA" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: SWOT Matrix Scores */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg md:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-400" />
                    ดัชนีความพร้อม SWOT
                  </h4>
                  <span className="text-[10px] text-slate-400">คะแนนประเมิน</span>
                </div>
                <div className="h-52 w-full flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentReport.swotMetrics || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={105} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                        {(currentReport.swotMetrics || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* DETAILED CONTENT SECTIONS */}
            <div className="space-y-6">
              
              {/* 1. Executive Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  1. บทสรุปสำหรับผู้บริหาร (Executive Summary)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentReport.execSummary}
                </p>
              </div>

              {/* 2. Key Findings */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  2. ข้อค้นพบสำคัญ (Key Findings)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentReport.keyFindings?.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-xl flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-300 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. SWOT Analysis Matrix */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  3. ตารางวิเคราะห์ SWOT (SWOT Analysis Matrix)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      จุดแข็ง (Strengths)
                    </h4>
                    <ul className="space-y-2">
                      {currentReport.swotData?.strengths?.map((s, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-400 mb-2.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      จุดอ่อน (Weaknesses)
                    </h4>
                    <ul className="space-y-2">
                      {currentReport.swotData?.weaknesses?.map((w, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-blue-950/20 border border-blue-800/40 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-400 mb-2.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      โอกาส (Opportunities)
                    </h4>
                    <ul className="space-y-2">
                      {currentReport.swotData?.opportunities?.map((o, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-rose-400 mb-2.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                      อุปสรรคและความเสี่ยง (Threats)
                    </h4>
                    <ul className="space-y-2">
                      {currentReport.swotData?.threats?.map((t, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                          <ChevronRight className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 4. Market Dynamics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  4. การวิเคราะห์สภาพแวดล้อมตลาดและการแข่งขัน (Market Dynamics)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentReport.marketAnalysis}
                </p>
              </div>

              {/* 5 & 6. Risks & Strategic Action Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Risk Assessment */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    5. การประเมินความเสี่ยงและมาตรการรับมือ
                  </h3>
                  <div className="space-y-3">
                    {currentReport.riskAssessment?.map((risk, idx) => (
                      <div key={idx} className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    6. ข้อเสนอแนะเชิงกลยุทธ์ (Strategic Action Plan)
                  </h3>
                  <div className="space-y-3">
                    {currentReport.recommendations?.map((rec, idx) => {
                      if (typeof rec === 'string') {
                        return (
                          <div key={idx} className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                            <span className="font-bold text-emerald-400">{idx + 1}.</span>
                            <span>{rec}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-emerald-400">{rec.phase}</span>
                            {rec.impact && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                ผลกระทบ: {rec.impact}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-100">{rec.title}</div>
                          <p className="text-slate-400">{rec.action}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: CASE STUDY PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                ตัวอย่างกรณีศึกษาและแม่แบบธุรกิจสำเร็จรูป
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                คลิกเลือกหัวข้อตัวอย่างเพื่อนำเข้าข้อมูลและทำการวิเคราะห์ได้ทันที
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SAMPLE_PRESETS.map((preset, index) => (
                <div
                  key={index}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-md">
                        {preset.industry}
                      </span>
                      <span className="text-xs text-slate-500">แม่แบบ: {preset.template.toUpperCase()}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {preset.topic}
                    </h3>

                    <div className="text-xs text-slate-400 space-y-1.5">
                      <div><strong className="text-slate-300">คู่แข่งเปรียบเทียบ:</strong> {preset.competitors}</div>
                      <div><strong className="text-slate-300">โจทย์วิจัย:</strong> {preset.specificQuestions}</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleApplyPreset(preset)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                    >
                      <span>นำข้อมูลนี้ไปสร้างรายงาน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SAVED HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-cyan-400" />
                  คลังรายงานการวิจัยธุรกิจ
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  รายงานทั้งหมดที่บันทึกไว้บนอุปกรณ์ของคุณ ({savedReports.length} รายการ)
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อรายงาน..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">ไม่พบรายงานที่ตรงกับการค้นหา</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  สร้างรายงานวิจัยธุรกิจใหม่ หรือล้างคำค้นหาเพื่อดูรายงานทั้งหมด
                </p>
                <button
                  onClick={() => setActiveTab('generator')}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  สร้างรายงานใหม่
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => {
                      setCurrentReport(report);
                      setActiveTab('editor');
                    }}
                    className="bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                          {report.template?.toUpperCase()}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSaved(report.id, e)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="ลบรายงาน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                        {report.title}
                      </h3>
                      
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                        {report.execSummary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">{report.createdAt}</span>
                      <span className="text-cyan-400 font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>เปิดอ่าน</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-900/60 py-4 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          BizResearch AI — แพลตฟอร์มวิจัยและวิเคราะห์กลยุทธ์ธุรกิจภาษาไทย ขับเคลื่อนด้วยโมเดล Gemini 3.8 Flash
        </div>
      </footer>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          header, footer, nav, button, .print\\:hidden { display: none !important; }
          .bg-slate-900, .bg-slate-950 { background: white !important; border-color: #cbd5e1 !important; color: black !important; box-shadow: none !important; }
          .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-400 { color: #1e293b !important; }
          .text-cyan-400, .text-emerald-400, .text-amber-400, .text-rose-400 { color: #0284c7 !important; }
        }
      `}</style>
    </div>
  );
}
