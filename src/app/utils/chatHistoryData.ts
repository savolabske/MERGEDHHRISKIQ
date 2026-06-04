import {
  CHAT_LIST_QUERIES,
  createChatHistoryThread,
} from '../data/chatAiResponses';

// Pre-generated conversation histories for each chat history item
// These represent completed conversations with multiple turns of back-and-forth

export const generateHistoryConversations = () => {
  const historyId1 = Date.now() - 1000000; // Base timestamp
  
  return {
    // History ID 1: Security incidents in Lower Shabelle
    '1': [
      {
        id: `${historyId1}-1`,
        type: 'user',
        content: 'Security incidents in Lower Shabelle in the last 30 days',
        contentType: 'text'
      },
      {
        id: `${historyId1}-2`,
        type: 'assistant',
        content: '🛡️ **Lower Shabelle — Last 30 days**\n\n**9 incidents** in 30 days, mostly **Afgooye** and **Marka**. Armed clashes and IEDs drive the highest exposure; **3 rated high risk**. [Source 1]\n\n• Two missions rerouted; **no staff casualties** [Source 2]\n• Slight **uptick** vs the prior cycle [Source 2]\n🔴 **Afgooye corridor** — highest concentration [Source 1]',
        contentType: 'text',
        sources: [
          {
            id: '1',
            type: 'knowledge-base',
            title: 'Somalia Security Risk Assessment Q4 2025',
            excerpt: 'Comprehensive analysis of security threats in Mogadishu and surrounding regions, including kidnapping risk assessment and mitigation strategies.',
            date: 'Feb 15, 2026',
            category: 'Security Reports'
          },
          {
            id: '2',
            type: 'knowledge-base',
            title: 'Internal Risks - Critical Threats Database',
            excerpt: 'Internal database containing 156 active risks across all operational areas with incident data.',
            date: 'Updated daily',
            category: 'Internal Database'
          }
        ]
      },
      {
        id: `${historyId1}-3`,
        type: 'user',
        content: 'What are the recommended security protocols for the Afgooye corridor?',
        contentType: 'text'
      },
      {
        id: `${historyId1}-4`,
        type: 'assistant',
        content: '🛡️ **Afgooye corridor protocols**\n\n**7 incidents** in 30 days — treat as **high threat**. All movements need Security Cell approval **48h** ahead. [Source 3]\n\n• **Daylight only** (07:00–16:30); no weekend travel [Source 3]\n• **2 armed guards** minimum; GPS check-in every **15 min** [Source 3]\n• Use approved green routes; **avoid KM13** [Source 3]\n\n🔴 **Threat level: HIGH** [Source 1]',
        contentType: 'text',
        sources: [
          {
            id: '3',
            type: 'knowledge-base',
            title: 'Standard Operating Procedures - Security Management',
            excerpt: 'Detailed protocols for movement in high-risk areas including escort requirements and communication procedures.',
            date: 'Jan 2026',
            category: 'SOPs'
          }
        ]
      }
    ],
    
    // History ID 2: Cholera outbreak trends
    '2': [
      {
        id: `${historyId1 + 1}-1`,
        type: 'user',
        content: 'What are the cholera outbreak trends in Baidoa IDP camps?',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 1}-2`,
        type: 'assistant',
        content: '💧 **Cholera — Baidoa IDP camps**\n\n**Escalating outbreak** since early February: **287 suspected**, **156 confirmed**, CFR **4.2%** (**+340%** vs January). [Source 4]\n\n• **Horseed** — 94 cases (highest attack rate) [Source 4]\n• **Aidid** — 76 cases; sanitation below SPHERE [Source 5]\n🔴 **Water contamination** at 8/12 points tested [Source 5]\n\n⚠️ CTC at **94%** capacity; IV fluids critical [Source 4]',
        contentType: 'text',
        sources: [
          {
            id: '4',
            type: 'knowledge-base',
            title: 'Weekly Epidemiological Bulletin - Feb 2026',
            excerpt: 'Disease surveillance data for IDP camps including cholera, measles, and acute watery diarrhea trends.',
            date: 'Feb 20, 2026',
            category: 'Health Reports'
          },
          {
            id: '5',
            type: 'knowledge-base',
            title: 'WASH Cluster Assessment - Baidoa IDPs',
            excerpt: 'Water quality testing results and sanitation coverage analysis for Baidoa displacement sites.',
            date: 'Feb 10, 2026',
            category: 'WASH'
          }
        ]
      },
      {
        id: `${historyId1 + 1}-3`,
        type: 'user',
        content: 'How can we prevent further spread?',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 1}-4`,
        type: 'assistant',
        content: '💧 **Cholera prevention — next 72h**\n\nFocus on **water safety** and **case detection** in Horseed, Aidid, and Banadir camps. [Source 6]\n\n• Chlorinate all points to **0.5 mg/L**; 3× daily testing [Source 6]\n• Deploy **6 water bladders** + double trucking to Horseed [Source 6]\n• Expand CTC to **100 beds**; pre-position IV fluids [Source 6]\n• House-to-house screening + hygiene promotion **within 24h** [Source 6]',
        contentType: 'text',
        sources: [
          {
            id: '6',
            type: 'knowledge-base',
            title: 'Cholera Response Protocol - WHO Guidelines',
            excerpt: 'Standard operating procedures for cholera outbreak response in humanitarian settings.',
            date: '2025',
            category: 'Guidelines'
          }
        ]
      }
    ],

    // History ID 3: Critical infrastructure damage
    '3': [
      {
        id: `${historyId1 + 2}-1`,
        type: 'user',
        content: 'Show me critical infrastructure damage from recent flooding',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 2}-2`,
        type: 'assistant',
        content: '🌊 **Flood damage — critical infrastructure**\n\nShabelle overflow (10–22 Feb) caused **$12.8M** damage; **48,000** people affected across Hiraan and Middle Shabelle. [Source 7]\n\n🔴 **Beledweyne bridge** — closed; convoys +180km detour [Source 7]\n🔴 **Jowhar–Balcad road** — impassable; town isolated [Source 7]\n🔴 **Beledweyne water plant** — offline; 85k without treated water [Source 8]\n\n• Bailey bridge + emergency trucking this week [Source 7]\n• Mobile clinics for Buuloburto catchment [Source 8]',
        contentType: 'text',
        sources: [
          {
            id: '7',
            type: 'knowledge-base',
            title: 'Flood Damage Assessment Report - Shabelle Basin',
            excerpt: 'Infrastructure impact survey conducted Feb 18-20, 2026 covering transportation, WASH, health, and education facilities.',
            date: 'Feb 21, 2026',
            category: 'Assessment Reports'
          },
          {
            id: '8',
            type: 'knowledge-base',
            title: 'Critical Infrastructure Inventory - Somalia Operations',
            excerpt: 'Complete database of humanitarian infrastructure assets with GPS coordinates and operational status.',
            date: 'Updated weekly',
            category: 'Asset Management'
          }
        ]
      }
    ],

    // History ID 4: Top operational risks summary
    '4': [
      {
        id: `${historyId1 + 3}-1`,
        type: 'user',
        content: 'Summarize top operational risks for February 2026',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 3}-2`,
        type: 'assistant',
        content: '🧭 **Top operational risks — February 2026**\n\n**Moderate rise** in high-likelihood risks across South-Central Somalia. [Source 9]\n\n• **Armed conflict** limiting field mobility [Source 9]\n• **Flooding** disrupting riverine access [Source 9]\n• **Supply delays** hitting humanitarian delivery [Source 9]\n\nHighest impact: **Lower Shabelle, Hiraan, and Bay**. [Source 9]',
        contentType: 'briefing',
        sources: [
          {
            id: '9',
            type: 'knowledge-base',
            title: 'Monthly Risk Briefing - February 2026',
            excerpt: 'Executive summary of priority operational risks with trend analysis and recommended actions.',
            date: 'Feb 24, 2026',
            category: 'Risk Management'
          }
        ]
      },
      {
        id: `${historyId1 + 3}-3`,
        type: 'user',
        content: 'Compare this to January',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 3}-4`,
        type: 'assistant',
        content: '📈 **February vs January 2026**\n\nProfile **worsened**: high-likelihood **+12%**, severe-impact **+8%**, overall score **62 → 71**. [Source 10]\n\n• Conflict risks **9 → 13**; Lower Shabelle incidents **+42%** [Source 10]\n• Cholera **84 → 287**; CFR **2.1% → 4.2%** [Source 10]\n• Flooding damage **$2.1M → $12.8M** [Source 10]\n\n🔴 **Now:** restrict Lower Shabelle travel; scale cholera response [Source 10]',
        contentType: 'text',
        sources: [
          {
            id: '10',
            type: 'knowledge-base',
            title: 'Monthly Risk Briefing - January 2026',
            excerpt: 'Previous month risk assessment for trend comparison.',
            date: 'Jan 25, 2026',
            category: 'Risk Management'
          }
        ]
      }
    ],

    // History ID 5: Contractor compliance issues
    '5': [
      {
        id: `${historyId1 + 4}-1`,
        type: 'user',
        content: 'Which contractors are flagged for compliance or delivery issues?',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 4}-2`,
        type: 'assistant',
        content: '🤝 **Flagged contractors**\n\n**8 vendors** flagged (**$4.7M** total). **2 critical** need immediate action. [Source 11]\n\n🔴 **Baraako Logistics** — missed deliveries, cold-chain breach ($850K) [Source 11]\n🔴 **Sahal Construction** — 67 failed units; stop-work ($1.2M) [Source 12]\n🟠 **Hormuud Transport** — breakdowns, insurance lapse ($420K) [Source 11]\n\n• Terminate Sahal for safety; diversify Banadir routes [Source 12]',
        contentType: 'text',
        sources: [
          {
            id: '11',
            type: 'knowledge-base',
            title: 'Vendor Performance Dashboard - Q1 2026',
            excerpt: 'Real-time contractor compliance tracking with KPI scorecards and issue logs.',
            date: 'Updated daily',
            category: 'Procurement'
          },
          {
            id: '12',
            type: 'knowledge-base',
            title: 'Contract Management Database',
            excerpt: 'Master record of all active contracts with financial details and performance history.',
            date: 'Feb 2026',
            category: 'Procurement'
          }
        ]
      },
      {
        id: `${historyId1 + 4}-3`,
        type: 'user',
        content: 'What is the process for terminating Sahal Construction?',
        contentType: 'text'
      },
      {
        id: `${historyId1 + 4}-4`,
        type: 'assistant',
        content: '📋 **Terminate Sahal Construction**\n\nGrounds: **material breach** (Section 12.3) — **67 units** failed inspection, falsified progress claims. [Source 13]\n\n• **Day 1:** notice of breach, stop-work, freeze payments [Source 13]\n• **Days 6–10:** third-party structural audit (~$18k) [Source 13]\n• **Days 20–40:** fast-track replacement contractor [Source 13]\n\n🔴 Cordon failed units; deploy emergency tents for displaced families [Source 13]',
        contentType: 'text',
        sources: [
          {
            id: '13',
            type: 'knowledge-base',
            title: 'Procurement Policy Manual - Contract Termination Procedures',
            excerpt: 'Standard operating procedures for vendor termination including legal requirements and settlement processes.',
            date: '2025',
            category: 'Procurement'
          }
        ]
      }
    ],

    ...Object.fromEntries(
      Object.entries(CHAT_LIST_QUERIES).map(([id, query]) => [
        id,
        createChatHistoryThread(query, `hist-${id}`),
      ])
    ),
  };
};
