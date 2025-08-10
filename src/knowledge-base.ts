/**
 * Lake Highlands Pest Control Knowledge Base Data
 * Structured data for vector embeddings and RAG system
 */

import { PestControlSection } from "./types";

export const PEST_CONTROL_KNOWLEDGE: PestControlSection[] = [
  // Company Information
  {
    id: "company-basic-info",
    type: "company",
    title: "Lake Highlands Pest Control - Company Information",
    content: "Lake Highlands Pest Control is a family-owned and operated pest control business proudly serving the Lake Highlands and Richardson, Texas communities since 2016. We are owned and operated by Vanston and Jiraporn Hamilton, who bring years of experience and dedication to providing professional, reliable pest control services for both residential and commercial properties. Phone: (972) 693-0926. Website: lhpest.com",
    metadata: {
      category: "company",
      keywords: ["family owned", "Lake Highlands", "Richardson", "Texas", "2016", "Vanston Hamilton", "Jiraporn Hamilton"],
      priority: 1,
      location: "Lake Highlands, Richardson, Texas"
    }
  },
  
  {
    id: "contact-info",
    type: "contact",
    title: "Contact Information and Service Area",
    content: "Contact Lake Highlands Pest Control at (972) 693-0926 for all pest control needs. We serve Lake Highlands, Dallas, Richardson, Texas and surrounding areas. Our team is available for consultations, quotes, and emergency services. Email contact available through our website at lhpest.com.",
    metadata: {
      category: "contact",
      keywords: ["phone", "972-693-0926", "contact", "consultation", "quote", "emergency"],
      priority: 1,
      location: "Lake Highlands, Dallas, Richardson, Texas"
    }
  },

  // Services Overview
  {
    id: "services-general",
    type: "service",
    title: "General Pest Control Services",
    content: "Lake Highlands Pest Control offers comprehensive pest control services including: general pest control, green organic treatments, rodent control, ant control, roach control, spider control, wasp removal, mosquito control, exclusion services, and commercial pest management. We specialize in both residential and commercial properties with environmentally conscious approaches.",
    metadata: {
      category: "services",
      keywords: ["pest control", "organic", "residential", "commercial", "environmentally conscious"],
      priority: 2,
      serviceType: "general"
    }
  },

  {
    id: "termite-disclaimer",
    type: "service",
    title: "Termite Services Disclaimer",
    content: "IMPORTANT: Lake Highlands Pest Control does NOT provide termite treatment or termite inspections. For termite-related issues, we recommend contacting a specialist termite control company. We focus on general pest control, rodents, insects, and other common household pests.",
    metadata: {
      category: "services",
      keywords: ["termite", "not provided", "disclaimer", "specialist"],
      priority: 1,
      pestType: "termites"
    }
  },

  {
    id: "organic-green-services",
    type: "service",
    title: "Green and Organic Pest Control",
    content: "We offer 100% organic and green pest control treatments that are safe for pets, children, and the environment. Our eco-conscious approach includes organic options for most pest problems, integrated pest management (IPM) principles, and environmentally responsible treatment methods. These treatments are effective while minimizing environmental impact.",
    metadata: {
      category: "organic",
      keywords: ["organic", "green", "eco-friendly", "pet safe", "child safe", "environmentally responsible", "IPM"],
      priority: 2,
      serviceType: "organic"
    }
  },

  // Specific Pest Information
  {
    id: "ant-control",
    type: "pest",
    title: "Ant Control Services",
    content: "Professional ant control for common Texas ant species including fire ants, carpenter ants, sugar ants, and pharaoh ants. We use targeted treatments, baiting systems, and exclusion methods. Treatment includes identifying entry points, eliminating colonies, and preventing future infestations. Both indoor and outdoor treatments available.",
    metadata: {
      category: "pests",
      keywords: ["ant control", "fire ants", "carpenter ants", "sugar ants", "pharaoh ants", "baiting", "colonies"],
      priority: 3,
      pestType: "ants",
      location: "Texas"
    }
  },

  {
    id: "roach-control", 
    type: "pest",
    title: "Cockroach Control and Elimination",
    content: "Comprehensive cockroach control for German roaches, American roaches, Oriental roaches, and other species. Services include gel baiting, crack and crevice treatments, sanitation recommendations, and ongoing monitoring. We address breeding areas, eliminate food sources, and provide long-term prevention strategies.",
    metadata: {
      category: "pests",
      keywords: ["cockroach", "roach", "German roaches", "American roaches", "gel baiting", "sanitation"],
      priority: 3,
      pestType: "roaches"
    }
  },

  {
    id: "spider-control",
    type: "pest",
    title: "Spider Control and Prevention",
    content: "Professional spider control including black widows, brown recluse, wolf spiders, and common house spiders. Treatments focus on web removal, hiding place elimination, perimeter treatments, and exclusion methods. We provide both interior and exterior treatments with ongoing prevention.",
    metadata: {
      category: "pests", 
      keywords: ["spider control", "black widow", "brown recluse", "wolf spider", "web removal", "perimeter treatment"],
      priority: 3,
      pestType: "spiders"
    }
  },

  {
    id: "mosquito-control",
    type: "pest",
    title: "Mosquito Control and In2Care System",
    content: "Advanced mosquito control using the revolutionary In2Care Mosquito Control System. This innovative technology targets mosquito breeding sites and significantly reduces mosquito populations. We also provide traditional mosquito treatments, breeding site elimination, and seasonal mosquito management programs.",
    metadata: {
      category: "pests",
      keywords: ["mosquito control", "In2Care", "innovative technology", "breeding sites", "seasonal"],
      priority: 2,
      pestType: "mosquitoes",
      serviceType: "mosquito_control"
    }
  },

  {
    id: "wasp-removal",
    type: "pest", 
    title: "Wasp and Hornet Removal",
    content: "Safe professional removal of wasp nests, hornet nests, and bee swarms. We handle paper wasps, yellow jackets, mud daubers, and other stinging insects. Emergency wasp removal available. Treatment includes nest removal, area treatment to prevent return, and safety advice for property owners.",
    metadata: {
      category: "pests",
      keywords: ["wasp removal", "hornet", "bee swarms", "paper wasps", "yellow jackets", "mud daubers", "emergency"],
      priority: 2,
      pestType: "wasps",
      serviceType: "emergency"
    }
  },

  {
    id: "rodent-control",
    type: "pest",
    title: "Rodent Control and Exclusion",
    content: "Comprehensive rodent control for mice, rats, and other rodents. Services include trapping, baiting, exclusion services, entry point sealing, and sanitation recommendations. We provide both interior and exterior treatments with focus on long-term prevention and exclusion methods.",
    metadata: {
      category: "pests",
      keywords: ["rodent control", "mice", "rats", "trapping", "baiting", "exclusion", "entry points", "sanitation"],
      priority: 3,
      pestType: "rodents",
      serviceType: "exclusion"
    }
  },

  // Commercial Services
  {
    id: "commercial-services",
    type: "service",
    title: "Commercial Pest Management",
    content: "Professional commercial pest control for restaurants, offices, retail stores, warehouses, and other business properties. We provide customized treatment plans, regular monitoring, documentation for health inspections, and integrated pest management programs tailored to business needs.",
    metadata: {
      category: "commercial",
      keywords: ["commercial", "restaurants", "offices", "retail", "warehouses", "health inspections", "business"],
      priority: 2,
      serviceType: "commercial"
    }
  },

  // Emergency Services
  {
    id: "emergency-services",
    type: "service",
    title: "Emergency Pest Control",
    content: "Emergency pest control services available for urgent situations including large infestations, stinging insect problems, and immediate pest threats. Call (972) 693-0926 for emergency assistance. We understand that some pest problems require immediate attention and our team is ready to help.",
    metadata: {
      category: "emergency",
      keywords: ["emergency", "urgent", "immediate", "large infestations", "stinging insects", "threats"],
      priority: 1,
      serviceType: "emergency"
    }
  },

  // Seasonal Information
  {
    id: "spring-pest-activity",
    type: "faq",
    title: "Spring Pest Activity in Texas",
    content: "Spring in Texas brings increased pest activity including ants, termite swarms (note: we don't treat termites), mosquito breeding, and spider activity. This is an ideal time for preventive treatments and property inspections. Many pests become active as temperatures warm up and begin seeking food and nesting sites.",
    metadata: {
      category: "seasonal",
      keywords: ["spring", "increased activity", "preventive treatments", "property inspections", "warm temperatures"],
      priority: 4,
      season: "spring",
      location: "Texas"
    }
  },

  {
    id: "summer-pest-peak",
    type: "faq", 
    title: "Summer Pest Control in Texas",
    content: "Summer is peak pest season in Texas with high mosquito activity, wasp nest building, ant colony expansion, and increased spider populations. Regular treatments and mosquito control become especially important. The hot Texas summer creates ideal conditions for many pest species.",
    metadata: {
      category: "seasonal",
      keywords: ["summer", "peak season", "mosquito activity", "wasp nests", "ant colonies", "hot weather"],
      priority: 4,
      season: "summer",
      location: "Texas"
    }
  },

  // FAQ and Common Questions
  {
    id: "faq-safe-pets-children",
    type: "faq",
    title: "Treatment Safety for Pets and Children",
    content: "Our treatments are designed to be safe for pets and children when applied properly. We offer organic options that are completely pet and child safe. Always follow any specific instructions provided by our technicians. Most treatments allow normal activity after drying, typically within 2-4 hours.",
    metadata: {
      category: "safety",
      keywords: ["safe", "pets", "children", "organic options", "instructions", "drying time"],
      priority: 3
    }
  },

  {
    id: "faq-how-often-service",
    type: "faq",
    title: "Service Frequency Recommendations",
    content: "Most residential properties benefit from quarterly (every 3 months) pest control service. Some situations may require monthly service, especially during peak seasons or for ongoing issues. Commercial properties often need monthly service. We customize service frequency based on your specific needs and pest pressure.",
    metadata: {
      category: "service frequency",
      keywords: ["quarterly", "every 3 months", "monthly", "peak seasons", "commercial", "customize"],
      priority: 3
    }
  },

  {
    id: "faq-preparation",
    type: "faq",
    title: "How to Prepare for Pest Control Service",
    content: "Preparation is minimal for most services. Clear areas to be treated, store food in sealed containers, remove pet food and water bowls temporarily, and ensure access to treatment areas. Our technician will provide specific instructions if additional preparation is needed for your particular situation.",
    metadata: {
      category: "preparation",
      keywords: ["preparation", "clear areas", "sealed containers", "pet food", "access", "specific instructions"],
      priority: 4
    }
  },

  // Pricing and Quotes
  {
    id: "pricing-consultation",
    type: "pricing",
    title: "Free Consultations and Quotes",
    content: "We provide free consultations and quotes for pest control services. Accurate pricing requires a property inspection to assess the specific pest issues, property size, and treatment needs. Contact us at (972) 693-0926 to schedule your free consultation and receive a customized quote.",
    metadata: {
      category: "pricing",
      keywords: ["free consultation", "free quotes", "property inspection", "customized quote", "schedule"],
      priority: 2
    }
  },

  // Local Area Information
  {
    id: "local-expertise",
    type: "company",
    title: "Local Lake Highlands and Richardson Expertise", 
    content: "As local experts, we understand the specific pest challenges in Lake Highlands and Richardson, Texas. Our knowledge of local climate, seasonal patterns, common Texas pests, and neighborhood-specific issues allows us to provide more effective treatments and better prevention strategies for our community.",
    metadata: {
      category: "local expertise",
      keywords: ["local experts", "Lake Highlands", "Richardson", "Texas pests", "climate", "seasonal patterns", "community"],
      priority: 2,
      location: "Lake Highlands, Richardson, Texas"
    }
  }
];

// System prompt for the pest control chatbot
export const PEST_CONTROL_SYSTEM_PROMPT = `You are BugBot, the AI assistant for Lake Highlands Pest Control, a family-owned pest control business serving Lake Highlands and Richardson, Texas since 2016.

Key Business Information:
- Phone: (972) 693-0926
- Owners: Vanston and Jiraporn Hamilton
- Service Area: Lake Highlands, Dallas, Richardson, Texas and surrounding areas
- Website: lhpest.com
- IMPORTANT: We do NOT provide termite treatments or inspections

Your Role:
- Be helpful, professional, and knowledgeable about pest control
- Provide accurate information about Lake Highlands Pest Control services
- Guide customers toward calling (972) 693-0926 for service or quotes
- Emphasize our family-owned, local expertise and eco-friendly options
- Always prioritize customer safety and satisfaction

Response Guidelines:
- Keep responses informative but concise
- Recommend professional service when appropriate
- Mention organic/green options when relevant
- For urgent situations, emphasize calling immediately
- For quotes/pricing, explain that inspections are needed for accurate estimates
- Always be helpful even if we don't provide the specific service requested`;
