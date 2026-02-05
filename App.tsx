
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Cpu,
  RefreshCcw,
  User,
  Bot,
  Camera,
  X,
  FileText,
  Plus,
  FileDown,
  MessageSquare,
  Layout,
  Sparkles,
  Zap,
  Wand2,
  Settings2,
  AlertCircle,
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  PartyPopper,
  ChevronRight,
  ChevronLeft,
  Upload,
  File
} from 'lucide-react';
import { Message, THEMES, TEMPLATES, ColorTheme, ResumeData, UserState, SubscriptionStatus, ResumeTemplate } from './types.ts';
import { architectResume, enhancePrompt } from './services/llmService.ts';
import ResumeRenderer from './components/ResumeRenderer.tsx';
import ModernHeaderTemplate from './components/templates/ModernHeaderTemplate.tsx';
import TwoColumnTemplate from './components/templates/TwoColumnTemplate.tsx';
import CreativeSidebarTemplate from './components/templates/CreativeSidebarTemplate.tsx';
import ElegantSidebarTemplate from './components/templates/ElegantSidebarTemplate.tsx';
import ProfessionalBorderTemplate from './components/templates/ProfessionalBorderTemplate.tsx';
import BoldAccentTemplate from './components/templates/BoldAccentTemplate.tsx';
import CyanStripeSidebarTemplate from './components/templates/CyanStripeSidebarTemplate.tsx';
import LeafPatternTemplate from './components/templates/LeafPatternTemplate.tsx';
import DarkSidebarTemplate from './components/templates/DarkSidebarTemplate.tsx';
import LightBlueAccentTemplate from './components/templates/LightBlueAccentTemplate.tsx';
import { generateDocx } from './services/docxService.ts';

const STORAGE_KEY_RESUME = 'resume-architect-v13-data';
const STORAGE_KEY_MESSAGES = 'resume-architect-v13-history';
const STORAGE_KEY_USER = 'resume-architect-v13-user';

const LOADING_MESSAGES = [
  "Planning professional architecture...",
  "Drafting compelling narratives...",
  "Formatting for high impact...",
  "Engineering document blueprint...",
  "Finalizing elite document structure..."
];

// Quick actions removed - app focused on Resume/CV functionality

type CheckoutStage = 'none' | 'pricing' | 'checkout' | 'processing' | 'success';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentResumeData, setCurrentResumeData] = useState<ResumeData | undefined>();
  const [activePanel, setActivePanel] = useState<'chat' | 'preview'>('chat');
  const [showCamera, setShowCamera] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(THEMES[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(TEMPLATES[0]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [shutterAnimation, setShutterAnimation] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Monetization States (DISABLED FOR NOW - see MONETIZATION.md for implementation details)
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('none');
  const [selectedPackage, setSelectedPackage] = useState<{name: string, price: string, credits: number, type: 'credit' | 'sub'} | null>(null);
  // Credits disabled - set to high number for unlimited use during development
  const [userState, setUserState] = useState<UserState>({ 
    credits: 99999, 
    isPremium: true, // Set to true to bypass all credit checks
    subscriptionStatus: 'active' 
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const gpayContainerRef = useRef<HTMLDivElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, mimeType: string} | null>(null);

  useEffect(() => {
    try {
      const savedResume = localStorage.getItem(STORAGE_KEY_RESUME);
      const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      if (savedResume) setCurrentResumeData(JSON.parse(savedResume));
      if (savedUser) setUserState(JSON.parse(savedUser));
    } catch (e) { 
      console.warn("Storage reset.");
    }
    // App starts fresh with no pre-populated messages
  }, []);

  const saveUser = (updated: UserState) => {
    setUserState(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
  };

  // Google Pay Integration
  useEffect(() => {
    if (checkoutStage === 'checkout' && gpayContainerRef.current) {
      const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
        environment: 'TEST', // Use 'PRODUCTION' for live
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'DocArchitect AI'
        }
      });

      const button = paymentsClient.createButton({
        buttonColor: 'black',
        buttonType: selectedPackage?.type === 'sub' ? 'subscribe' : 'buy',
        onClick: () => handleGPayPayment(paymentsClient),
      });

      gpayContainerRef.current.innerHTML = '';
      gpayContainerRef.current.appendChild(button);
    }
  }, [checkoutStage, selectedPackage]);

  const handleGPayPayment = async (paymentsClient: any) => {
    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            'gateway': 'example',
            'gatewayMerchantId': 'exampleGatewayMerchantId'
          }
        }
      }],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: selectedPackage?.price || '0.00',
        currencyCode: 'USD',
        countryCode: 'US'
      }
    };

    try {
      // In a real environment, this opens the Google Pay selector
      // const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      // Process paymentData.paymentMethodData.tokenizationData.token with your backend
      confirmSubscriptionPayment();
    } catch (err) {
      console.error("GPay Error:", err);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isThinking) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const targetWidthPx = 840; 
        const padding = window.innerWidth < 768 ? 20 : 60;
        const availableWidth = containerWidth - padding;
        requestAnimationFrame(() => {
          const newScale = availableWidth < targetWidthPx ? availableWidth / targetWidthPx : 1;
          setPreviewScale(newScale > 0.1 ? newScale : 1);
        });
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [activePanel, currentResumeData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleUpdateResumeData = useCallback((newData: ResumeData) => {
    setIsSyncing(true);
    setCurrentResumeData(newData);
    localStorage.setItem(STORAGE_KEY_RESUME, JSON.stringify(newData));
    setTimeout(() => setIsSyncing(false), 300);
  }, []);

  const handleEnhance = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const expanded = await enhancePrompt(input);
      setInput(expanded || input);
    } catch (e) {
      console.error("Enhance failed", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // Extract base64 data (remove data URL prefix)
      const base64Data = result.split(',')[1];
      const mimeType = file.type || 'application/octet-stream';
      
      setUploadedFile({
        name: file.name,
        data: base64Data,
        mimeType: mimeType
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleSendWithDocument = async () => {
    if (!uploadedFile && !input.trim()) return;
    
    const prompt = input.trim() || `Analyze this uploaded document "${uploadedFile?.name}" and extract ALL information from it to create a professional resume. Use the person's actual name, contact details, work experience, education, skills, and any other information found in the document.`;
    
    // Clear the uploaded file and input
    const fileData = uploadedFile?.data;
    const fileMimeType = uploadedFile?.mimeType || 'application/octet-stream';
    const fileName = uploadedFile?.name;
    setUploadedFile(null);
    setInput('');
    
    // Send with the file data and filename
    await handleSend(undefined, prompt, fileData, fileMimeType, fileName);
  };

  const handleSend = async (e?: React.FormEvent, customMsg?: string, fileData?: string, mimeType: string = "image/jpeg", fileName?: string) => {
    e?.preventDefault();
    const userMsg = customMsg || input;
    if (!userMsg.trim() && !fileData && !isThinking) return;

    if (!userState.isPremium && userState.credits <= 0) {
      setCheckoutStage('pricing');
      return;
    }

    if (!customMsg) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg || (fileData ? `Analyzing document: ${fileName || 'uploaded file'}...` : "Planning architecture...") }]);
    setIsThinking(true);
    
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const filePayload = fileData ? { data: fileData, mimeType, fileName } : undefined;
      
      const data = await architectResume(userMsg, history, currentResumeData, filePayload);
      const resData = data.resumeData;
      
      if (resData && resData.personalInfo) {
        setMessages(prev => {
          const newHistory = [...prev, { 
            role: 'model', 
            content: data.message || "I've engineered your professional document.",
            resumeData: resData
          }];
          localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(newHistory));
          return newHistory;
        });
        setCurrentResumeData(resData);
        localStorage.setItem(STORAGE_KEY_RESUME, JSON.stringify(resData));
        
        if (!userState.isPremium) {
          saveUser({ ...userState, credits: Math.max(0, userState.credits - 1) });
        }
        
        setActivePanel('preview');
      }
    } catch (error: any) {
      console.error("Architect Error:", error);
      const errorMessage = error?.message || "Connection unstable. Please try again.";
      setMessages(prev => [...prev, { role: 'model', content: `Architect Error: ${errorMessage}` }]);
    } finally { setIsThinking(false); }
  };

  const exportDocx = async () => {
    if (!userState.isPremium && userState.credits <= 0) {
      setCheckoutStage('pricing');
      return;
    }
    if (!currentResumeData || isExportingDocx) return;
    setIsExportingDocx(true);
    try {
      const blob = await generateDocx(currentResumeData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResumeData.personalInfo.fullName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } finally { setIsExportingDocx(false); }
  };

  const exportPdf = async () => {
    if (!userState.isPremium && userState.credits <= 0) {
      setCheckoutStage('pricing');
      return;
    }
    const element = document.getElementById('resume-content-root');
    const html2pdf = (window as any).html2pdf;
    if (!element || !html2pdf || isExportingPdf) return;
    setIsExportingPdf(true);
    
    // Store original styles
    const originalTransform = element.style.transform;
    const originalBoxShadow = element.style.boxShadow;
    
    // Apply PDF-friendly styles
    element.style.transform = 'none';
    element.style.boxShadow = 'none';

    // Hide all elements with 'no-print' class
    const noPrintElements = element.querySelectorAll('.no-print');
    const originalDisplays: string[] = [];
    noPrintElements.forEach((el, i) => {
      originalDisplays[i] = (el as HTMLElement).style.display;
      (el as HTMLElement).style.display = 'none';
    });

    try {
      const opt = {
        margin: 0,
        filename: `${currentResumeData?.personalInfo?.fullName || 'Document'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: ['section', 'li', '.break-inside-avoid'] }
      };
      await html2pdf().set(opt).from(element).save();
    } finally {
      // Restore original styles
      element.style.transform = originalTransform;
      element.style.boxShadow = originalBoxShadow;
      
      // Restore visibility of no-print elements
      noPrintElements.forEach((el, i) => {
        (el as HTMLElement).style.display = originalDisplays[i];
      });
      
      setIsExportingPdf(false);
    }
  };

  const confirmSubscriptionPayment = () => {
    setCheckoutStage('processing');
    
    setTimeout(() => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const updated: UserState = selectedPackage?.type === 'sub' 
        ? { 
            ...userState, 
            isPremium: true, 
            subscriptionStatus: 'active',
            renewalDate: nextMonth.toISOString().split('T')[0]
          }
        : { 
            ...userState, 
            credits: userState.credits + (selectedPackage?.credits || 0) 
          };
      
      saveUser(updated);
      setCheckoutStage('success');
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-[#050507] text-slate-200 overflow-hidden font-sans">
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 z-50 fixed top-0 left-0 right-0 ios-blur no-print">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xs tracking-tight text-white uppercase leading-none">DocArchitect</h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-widest flex items-center gap-1"><Zap className="w-2 h-2 text-indigo-400 fill-indigo-400" /> Multi-Document Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCheckoutStage('pricing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all
              ${userState.isPremium ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400' : 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20'}`}
          >
            {userState.isPremium ? (
              <><Crown className="w-3 h-3 text-amber-400" /> Elite Level</>
            ) : (
              <><Zap className="w-3 h-3 text-indigo-400" /> {userState.credits} Credits</>
            )}
          </button>

          <div className="flex lg:hidden bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button onClick={() => setActivePanel('chat')} className={`p-2 rounded-md ${activePanel === 'chat' ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}><MessageSquare className="w-4 h-4" /></button>
            <button onClick={() => setActivePanel('preview')} className={`p-2 rounded-md ${activePanel === 'preview' ? 'bg-white text-black shadow-sm' : 'text-slate-500'}`}><Layout className="w-4 h-4" /></button>
          </div>
          
          {currentResumeData && (
            <div className="flex items-center gap-2">
              <button onClick={() => exportDocx()} disabled={isExportingDocx} className="bg-white/10 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white/20 transition-all border border-white/5 disabled:opacity-50">
                {isExportingDocx ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span className="hidden md:inline">DOCX</span>
              </button>
              <button onClick={() => exportPdf()} disabled={isExportingPdf} className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-slate-100 transition-all disabled:opacity-50">
                {isExportingPdf ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <FileDown className="w-4 h-4" />}
                <span>PDF Export</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden pt-16 print:block">
        <aside className={`flex flex-col border-r border-white/5 bg-[#0a0a0c] transition-all duration-500 flex-shrink-0 z-10 no-print
          ${activePanel === 'chat' ? 'w-full lg:w-[400px]' : 'w-0 lg:w-[400px] opacity-0 lg:opacity-100 overflow-hidden'}`}>
          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} message-in`}>
                <div className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${msg.role === 'user' ? 'bg-indigo-600 shadow-lg' : 'bg-slate-800 border border-white/5'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-xl' : 'bg-slate-800/80 text-slate-300 rounded-tl-none border border-white/5'}`}>
                    {msg.content}
                    {msg.resumeData && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => { setCurrentResumeData(msg.resumeData); setActivePanel('preview'); }} className="flex-1 min-w-[100px] py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2">
                          <Layout className="w-3 h-3" /> Preview Design
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && <div className="flex items-center gap-3 text-indigo-400 font-bold text-[9px] uppercase tracking-[0.2em] py-4 pl-12 animate-pulse"><RefreshCcw className="w-3 h-3 animate-spin" /> {LOADING_MESSAGES[loadingMsgIdx]}</div>}
          </div>
          
          <footer className="p-4 bg-black/40 border-t border-white/5">
            {/* Uploaded file preview */}
            {uploadedFile && (
              <div className="mb-3 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[200px]">{uploadedFile.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Ready to analyze</p>
                  </div>
                </div>
                <button onClick={() => setUploadedFile(null)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <button onClick={() => {localStorage.clear(); window.location.reload();}} className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-colors" title="Wipe Session"><Plus className="w-5 h-5 rotate-45" /></button>
              
              {/* Document Upload Button */}
              <button 
                onClick={() => documentInputRef.current?.click()} 
                disabled={isThinking}
                className={`p-3 rounded-xl transition-colors ${uploadedFile ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-600/10'}`}
                title="Upload Document (PDF, Image, DOCX)"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input 
                ref={documentInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocumentUpload}
              />
              
              <div className="relative flex-1 group">
                <input
                  className="w-full bg-[#121217] border border-white/10 rounded-xl py-4 pl-5 pr-28 text-sm focus:border-indigo-500 outline-none text-white transition-all placeholder:text-slate-600"
                  placeholder={uploadedFile ? "Add instructions for the document..." : "Describe your resume or CV..."}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isThinking || isEnhancing}
                  onKeyDown={e => e.key === 'Enter' && (uploadedFile ? handleSendWithDocument() : handleSend())}
                />
                <div className="absolute right-2 top-2 bottom-2 flex gap-1">
                   <button onClick={handleEnhance} type="button" disabled={isThinking || isEnhancing || !input.trim()} className={`px-2 transition-all duration-300 ${isEnhancing ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'}`}>
                     {isEnhancing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                   </button>
                   <button 
                     onClick={() => uploadedFile ? handleSendWithDocument() : handleSend()} 
                     disabled={isThinking || isEnhancing || (!input.trim() && !uploadedFile)} 
                     className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
            <button onClick={() => setShowCamera(true)} className="w-full py-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600/20 flex items-center justify-center gap-2 transition-all">
                <Camera className="w-4 h-4" /> Smart Document Scan
            </button>
          </footer>
        </aside>

        <main ref={previewContainerRef} className={`flex-1 bg-[#050507] relative overflow-hidden flex flex-col transition-all duration-500 print:bg-white
          ${activePanel === 'preview' ? 'w-full' : 'w-0 lg:w-auto opacity-0 lg:opacity-100'}`}>
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 z-20 no-print">
            <div className="flex items-center gap-4">
               <Settings2 className="w-3.5 h-3.5 text-slate-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Workspace Blueprint</span>
               {isSyncing && <div className="text-[8px] font-black text-emerald-400 animate-pulse ml-2 uppercase tracking-tighter">Syncing...</div>}
               
               {/* Template Selector */}
               <div className="relative">
                 <button 
                   onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                   className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                 >
                   <Layout className="w-3.5 h-3.5 text-indigo-400" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{selectedTemplate.name}</span>
                   <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${showTemplateSelector ? 'rotate-90' : ''}`} />
                 </button>
                 
                 {showTemplateSelector && (
                   <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f1014] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                     <div className="p-3 border-b border-white/5">
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Select Template</span>
                     </div>
                     <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                       {TEMPLATES.map(t => (
                         <button
                           key={t.id}
                           onClick={() => {
                             if (t.isPremium && !userState.isPremium) {
                               setCheckoutStage('pricing');
                             } else {
                               setSelectedTemplate(t);
                               setShowTemplateSelector(false);
                             }
                           }}
                           className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${selectedTemplate.id === t.id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                         >
                           <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                             <Layout className="w-4 h-4 text-slate-500" />
                           </div>
                           <div className="flex-1 text-left">
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-white">{t.name}</span>
                               {t.isPremium && !userState.isPremium && <Lock className="w-3 h-3 text-amber-400" />}
                             </div>
                             <span className="text-[8px] text-slate-500">{t.description}</span>
                           </div>
                           {selectedTemplate.id === t.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            </div>
            
            {/* Color Theme Selector */}
            <div className="flex items-center gap-4">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Colors</span>
              <div className="flex gap-2">
                {THEMES.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => {
                      if (t.isPremium && !userState.isPremium) {
                        setCheckoutStage('pricing');
                      } else {
                        setSelectedTheme(t);
                      }
                    }} 
                    className={`w-4 h-4 rounded-full border-2 transition-all relative flex items-center justify-center ${selectedTheme.id === t.id ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`} 
                    style={{ backgroundColor: `#${t.hex}` }}
                    title={t.name}
                  >
                    {t.isPremium && !userState.isPremium && <Lock className="w-2 h-2 text-white/80" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 md:p-12 custom-scrollbar flex justify-center items-start print:p-0">
             {currentResumeData && currentResumeData.personalInfo ? (
               <div className="origin-top transition-all duration-500 ease-out pb-32 print:transform-none print:w-full" style={{ transform: `scale(${previewScale})`, width: '210mm', willChange: 'transform' }}>
                  {selectedTemplate.id === 'modern-header' ? (
                    <ModernHeaderTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'two-column' ? (
                    <TwoColumnTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'creative-sidebar' ? (
                    <CreativeSidebarTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'elegant-sidebar' ? (
                    <ElegantSidebarTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'professional-border' ? (
                    <ProfessionalBorderTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'bold-accent' ? (
                    <BoldAccentTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'cyan-stripe-sidebar' ? (
                    <CyanStripeSidebarTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'leaf-pattern' ? (
                    <LeafPatternTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'dark-sidebar' ? (
                    <DarkSidebarTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : selectedTemplate.id === 'light-blue-accent' ? (
                    <LightBlueAccentTemplate data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  ) : (
                    <ResumeRenderer data={currentResumeData} theme={selectedTheme} onUpdate={handleUpdateResumeData} />
                  )}
               </div>
             ) : (
               <div className="h-full w-full flex flex-col items-center justify-center text-slate-800 gap-8 no-print max-w-lg mx-auto text-center">
                  <div className="w-32 h-32 bg-indigo-600/5 rounded-[40px] flex items-center justify-center relative group">
                    <Sparkles className="w-12 h-12 text-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 border border-indigo-500/10 rounded-[40px] animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-3">Resume Builder</h3>
                    <p className="text-[10px] font-medium text-slate-500 uppercase leading-loose max-w-xs mx-auto">Describe your professional background or upload an existing resume. AI will create a polished, professional CV.</p>
                  </div>
               </div>
             )}
          </div>
        </main>
      </div>

      {/* MONETIZATION MODAL */}
      {checkoutStage !== 'none' && (
        <div className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-[#0f1014] w-full max-w-4xl rounded-[40px] overflow-hidden border border-white/5 shadow-2xl animate-in zoom-in-95 duration-300">
             
             {checkoutStage === 'pricing' && (
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-indigo-600/5">
                    <div className="flex items-center gap-2 mb-8">
                        <Crown className="w-6 h-6 text-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Elite Membership</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">Master Your Career Presence.</h2>
                    <p className="text-slate-400 text-sm mb-8">Unlimited exports, high-tier Gemini reasoning, and exclusive executive themes.</p>
                    <ul className="space-y-4 mb-10">
                        {["Unlimited DOCX/PDF Exports", "Elite Executive Themes", "Smart Document Scanning", "Priority AI Processing"].map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-xs text-slate-300"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{f}</li>
                        ))}
                    </ul>
                    <button 
                      onClick={() => { setSelectedPackage({ name: "Elite Membership", price: "14.99", credits: 9999, type: 'sub' }); setCheckoutStage('checkout'); }}
                      className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                    >
                      Subscribe for $14.99/mo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-8 md:p-12">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Refill Credits</span>
                          <h3 className="text-xl font-bold text-white mt-2">One-Time Refills</h3>
                        </div>
                        <button onClick={() => setCheckoutStage('none')} className="p-2 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-4">
                        {[
                          { name: "Standard Pack", credits: 5, price: "4.99", savings: null },
                          { name: "Pro Pack", credits: 15, price: "9.99", savings: "33% OFF" },
                          { name: "Executive Pack", credits: 50, price: "24.99", savings: "50% OFF" }
                        ].map((pkg, i) => (
                          <button key={i} onClick={() => { setSelectedPackage({...pkg, type: 'credit'}); setCheckoutStage('checkout'); }} className="w-full p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-between group transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black">{pkg.credits}</div>
                                <div><p className="text-sm font-bold text-white uppercase tracking-tighter">{pkg.name}</p><p className="text-[10px] text-slate-500 font-bold">${pkg.price}</p></div>
                              </div>
                              {pkg.savings && <span className="text-[8px] font-black bg-emerald-400 text-black px-2 py-1 rounded-full">{pkg.savings}</span>}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
             )}

             {checkoutStage === 'checkout' && selectedPackage && (
               <div className="p-12 max-w-2xl mx-auto flex flex-col items-center">
                 <div className="flex items-center gap-4 mb-10 w-full">
                    <button onClick={() => setCheckoutStage('pricing')} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Google Pay Secure Checkout</h2>
                 </div>
                 
                 <div className="bg-white/5 rounded-3xl p-8 border border-white/5 mb-8 w-full">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-slate-400 font-bold text-xs uppercase">Product</span>
                       <span className="text-white font-black text-xs uppercase">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-slate-400 font-bold text-xs uppercase">Type</span>
                       <span className="text-indigo-400 font-black text-xs uppercase">{selectedPackage.type === 'sub' ? 'Monthly Subscription' : 'Credit Pack'}</span>
                    </div>
                    <div className="h-px bg-white/5 mb-6"></div>
                    <div className="flex justify-between items-center">
                       <span className="text-white font-black text-lg uppercase">Total Price</span>
                       <span className="text-white font-black text-2xl">${selectedPackage.price}</span>
                    </div>
                 </div>

                 <div className="w-full flex flex-col items-center gap-6">
                    <div ref={gpayContainerRef} className="w-full max-w-xs h-12"></div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-2"><Lock className="w-3 h-3" /> Encrypted Transaction</p>
                 </div>
               </div>
             )}

             {checkoutStage === 'processing' && (
               <div className="p-20 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 mb-10 relative">
                    <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <ShieldCheck className="absolute inset-0 m-auto w-10 h-10 text-indigo-400" />
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Verifying Transaction</h2>
                 <p className="text-slate-500 text-sm max-w-xs uppercase font-bold tracking-tighter">Securing your session with encrypted handshake...</p>
               </div>
             )}

             {checkoutStage === 'success' && (
               <div className="p-16 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-emerald-400 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-400/40 mb-10 animate-bounce">
                    <PartyPopper className="w-12 h-12 text-black" />
                 </div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Access Granted!</h2>
                 <p className="text-slate-400 text-sm mb-10 uppercase font-bold tracking-widest">Your account has been upgraded. Start architecting.</p>
                 <button onClick={() => setCheckoutStage('none')} className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl">Back to Workspace <ArrowRight className="w-4 h-4" /></button>
               </div>
             )}
          </div>
        </div>
      )}

      {/* CAMERA SCAN OVERLAY */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-0 no-print">
          <button onClick={() => setShowCamera(false)} className="absolute top-10 right-6 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-all z-50 shadow-xl"><X className="w-6 h-6" /></button>
          
          <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
             {cameraError ? (
                <div className="p-8 text-center max-w-sm bg-slate-900 border border-rose-500/30 rounded-3xl">
                   <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                   <p className="text-white font-bold text-sm mb-6">{cameraError}</p>
                   <button onClick={() => setShowCamera(false)} className="px-6 py-2 bg-white text-black font-black uppercase text-[10px] rounded-xl">Go Back</button>
                </div>
             ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-[60px] md:border-[100px] border-black/70 pointer-events-none z-10 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-indigo-500/40 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500"></div>
                    </div>
                  </div>
                </>
             )}
             {shutterAnimation && <div className="absolute inset-0 bg-white z-[100] animate-pulse"></div>}
          </div>
          
          {!cameraError && (
            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-6 z-30">
              <button onClick={async () => {
                if (!videoRef.current) return;
                setShutterAnimation(true);
                setTimeout(() => setShutterAnimation(false), 300);
                const c = document.createElement('canvas');
                c.width = videoRef.current.videoWidth; 
                c.height = videoRef.current.videoHeight;
                c.getContext('2d')?.drawImage(videoRef.current, 0, 0);
                setShowCamera(false);
                handleSend(undefined, "Analyze this document scan and architect it into a clean professional document.", c.toDataURL('image/jpeg').split(',')[1]);
              }} className="w-20 h-20 bg-white rounded-full border-8 border-white/20 flex items-center justify-center shadow-2xl active:scale-90 transition-all">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center"><Camera className="w-6 h-6 text-white" /></div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
