import type { Category } from "../models/Product";

export interface SeedProduct {
  name: string;
  brand: string;
  category: Category;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  rating: number;
  numReviews: number;
  featured?: boolean;
  specs: { label: string; value: string }[];
}

export const seedProducts: SeedProduct[] = [
  // Laptops
  {
    name: "Aero 14 Pro",
    brand: "Aether",
    category: "laptops",
    description:
      "An ultralight 14-inch creator laptop with a 3K OLED display, all-day battery and a machined aluminium unibody that weighs just 1.2 kg.",
    price: 1499,
    compareAtPrice: 1699,
    stock: 12,
    rating: 4.8,
    numReviews: 214,
    featured: true,
    specs: [
      { label: "Display", value: '14" 3K OLED, 120Hz' },
      { label: "Processor", value: "12-core, up to 5.1 GHz" },
      { label: "Memory", value: "32 GB LPDDR5X" },
      { label: "Storage", value: "1 TB NVMe SSD" },
      { label: "Weight", value: "1.2 kg" },
    ],
  },
  {
    name: "Titan 16 Gaming",
    brand: "Vortex",
    category: "laptops",
    description:
      "A 16-inch gaming powerhouse with a 240Hz QHD+ panel, advanced vapour-chamber cooling and a per-key RGB keyboard.",
    price: 2199,
    stock: 6,
    rating: 4.7,
    numReviews: 98,
    specs: [
      { label: "Display", value: '16" QHD+ 240Hz' },
      { label: "Graphics", value: "16 GB dedicated GPU" },
      { label: "Memory", value: "32 GB DDR5" },
      { label: "Storage", value: "2 TB NVMe SSD" },
    ],
  },
  {
    name: "Slate 13 Air",
    brand: "Lumen",
    category: "laptops",
    description:
      "Fanless, silent and impossibly thin. Slate 13 Air is the everyday laptop for students and travellers.",
    price: 899,
    compareAtPrice: 999,
    stock: 25,
    rating: 4.5,
    numReviews: 342,
    specs: [
      { label: "Display", value: '13.3" 2.5K IPS' },
      { label: "Memory", value: "16 GB" },
      { label: "Storage", value: "512 GB SSD" },
      { label: "Battery", value: "Up to 18 hours" },
    ],
  },
  {
    name: "Forge 15 Workstation",
    brand: "Aether",
    category: "laptops",
    description:
      "Built for engineers and 3D artists — ISV-certified graphics, 64 GB of memory and a colour-calibrated 4K display.",
    price: 2899,
    stock: 3,
    rating: 4.9,
    numReviews: 41,
    specs: [
      { label: "Display", value: '15.6" 4K, 100% DCI-P3' },
      { label: "Memory", value: "64 GB DDR5" },
      { label: "Storage", value: "2 TB NVMe SSD" },
    ],
  },

  // Headphones
  {
    name: "Pulse ANC Over-Ear",
    brand: "Sonora",
    category: "headphones",
    description:
      "Industry-leading adaptive noise cancellation, 40-hour battery and plush memory-foam cushions for all-day listening.",
    price: 349,
    compareAtPrice: 399,
    stock: 40,
    rating: 4.8,
    numReviews: 1289,
    featured: true,
    specs: [
      { label: "Driver", value: "40 mm dynamic" },
      { label: "Battery", value: "40 hours (ANC on)" },
      { label: "Connectivity", value: "Bluetooth 5.4, USB-C audio" },
    ],
  },
  {
    name: "Echo Buds Pro",
    brand: "Sonora",
    category: "headphones",
    description:
      "Tiny true-wireless earbuds with spatial audio, transparency mode and a wireless charging case.",
    price: 199,
    stock: 60,
    rating: 4.6,
    numReviews: 876,
    specs: [
      { label: "Battery", value: "8 h + 24 h case" },
      { label: "Water resistance", value: "IPX5" },
      { label: "Charging", value: "USB-C, Qi wireless" },
    ],
  },
  {
    name: "Studio Reference MX",
    brand: "Halcyon",
    category: "headphones",
    description:
      "Open-back studio headphones tuned for a flat, accurate response. The choice for mixing and critical listening.",
    price: 279,
    stock: 15,
    rating: 4.7,
    numReviews: 203,
    specs: [
      { label: "Type", value: "Open-back, wired" },
      { label: "Impedance", value: "80 Ω" },
      { label: "Frequency response", value: "5 Hz – 40 kHz" },
    ],
  },
  {
    name: "Rally Gaming Headset",
    brand: "Vortex",
    category: "headphones",
    description:
      "Low-latency 2.4 GHz wireless gaming headset with a detachable boom mic and 7.1 virtual surround.",
    price: 129,
    compareAtPrice: 159,
    stock: 0,
    rating: 4.4,
    numReviews: 512,
    specs: [
      { label: "Connectivity", value: "2.4 GHz + Bluetooth" },
      { label: "Battery", value: "30 hours" },
      { label: "Mic", value: "Detachable, noise-cancelling" },
    ],
  },

  // Keyboards
  {
    name: "Keystone 75 Mechanical",
    brand: "Keystone",
    category: "keyboards",
    description:
      "A gasket-mounted 75% mechanical keyboard with hot-swappable switches, PBT keycaps and a CNC aluminium case.",
    price: 189,
    stock: 22,
    rating: 4.9,
    numReviews: 667,
    featured: true,
    specs: [
      { label: "Layout", value: "75%, 84 keys" },
      { label: "Switches", value: "Linear, hot-swappable" },
      { label: "Connectivity", value: "USB-C, Bluetooth, 2.4 GHz" },
    ],
  },
  {
    name: "Flow Low-Profile",
    brand: "Lumen",
    category: "keyboards",
    description:
      "Slim wireless keyboard with low-profile mechanical switches and smart backlighting. Pairs with three devices.",
    price: 139,
    stock: 30,
    rating: 4.5,
    numReviews: 290,
    specs: [
      { label: "Layout", value: "Full size" },
      { label: "Switches", value: "Low-profile tactile" },
      { label: "Battery", value: "Up to 3 months" },
    ],
  },
  {
    name: "Apex TKL Pro",
    brand: "Vortex",
    category: "keyboards",
    description:
      "Tournament-grade tenkeyless keyboard with adjustable magnetic switches and 8000 Hz polling.",
    price: 219,
    compareAtPrice: 249,
    stock: 9,
    rating: 4.7,
    numReviews: 188,
    specs: [
      { label: "Layout", value: "TKL, 87 keys" },
      { label: "Switches", value: "Magnetic, 0.1–4.0 mm actuation" },
      { label: "Polling rate", value: "8000 Hz" },
    ],
  },

  // Mice
  {
    name: "Glide Wireless Pro",
    brand: "Vortex",
    category: "mice",
    description:
      "A 55 g ultralight esports mouse with a 30K DPI sensor and 90-hour battery life.",
    price: 149,
    stock: 35,
    rating: 4.8,
    numReviews: 931,
    featured: true,
    specs: [
      { label: "Weight", value: "55 g" },
      { label: "Sensor", value: "30,000 DPI optical" },
      { label: "Battery", value: "90 hours" },
    ],
  },
  {
    name: "Ergo Vertical",
    brand: "Lumen",
    category: "mice",
    description:
      "A vertical ergonomic mouse that reduces wrist strain with a natural handshake grip.",
    price: 99,
    stock: 18,
    rating: 4.4,
    numReviews: 402,
    specs: [
      { label: "Angle", value: "57° vertical" },
      { label: "Connectivity", value: "Bluetooth + USB receiver" },
      { label: "Buttons", value: "6 programmable" },
    ],
  },
  {
    name: "Precision MX Master",
    brand: "Keystone",
    category: "mice",
    description:
      "Productivity mouse with a MagSpeed scroll wheel, thumb wheel and cross-computer control.",
    price: 109,
    compareAtPrice: 129,
    stock: 4,
    rating: 4.7,
    numReviews: 1544,
    specs: [
      { label: "Sensor", value: "8,000 DPI, works on glass" },
      { label: "Battery", value: "70 days" },
      { label: "Charging", value: "USB-C quick charge" },
    ],
  },

  // Monitors
  {
    name: "Vista 27 4K",
    brand: "Halcyon",
    category: "monitors",
    description:
      "A 27-inch 4K IPS display with 98% DCI-P3 coverage and a single-cable USB-C 96 W connection.",
    price: 549,
    compareAtPrice: 629,
    stock: 14,
    rating: 4.7,
    numReviews: 322,
    featured: true,
    specs: [
      { label: "Size", value: '27"' },
      { label: "Resolution", value: "3840 × 2160" },
      { label: "Ports", value: "USB-C 96 W, HDMI 2.1, DP 1.4" },
    ],
  },
  {
    name: "Horizon 34 Ultrawide",
    brand: "Aether",
    category: "monitors",
    description:
      "Curved 34-inch ultrawide OLED at 175 Hz. Immersive for games, spacious for work.",
    price: 999,
    stock: 7,
    rating: 4.8,
    numReviews: 156,
    specs: [
      { label: "Size", value: '34" curved 1800R' },
      { label: "Panel", value: "QD-OLED, 175 Hz" },
      { label: "Resolution", value: "3440 × 1440" },
    ],
  },
  {
    name: "Swift 25 Esports",
    brand: "Vortex",
    category: "monitors",
    description: "A 24.5-inch 360 Hz Fast IPS monitor built for competitive shooters.",
    price: 429,
    stock: 11,
    rating: 4.6,
    numReviews: 87,
    specs: [
      { label: "Size", value: '24.5"' },
      { label: "Refresh rate", value: "360 Hz" },
      { label: "Response time", value: "0.5 ms GtG" },
    ],
  },

  // Accessories
  {
    name: "Nexus 11-in-1 USB-C Dock",
    brand: "Keystone",
    category: "accessories",
    description:
      "Dual 4K display output, 100 W passthrough charging, 2.5 GbE and an SD card reader in one compact dock.",
    price: 179,
    stock: 28,
    rating: 4.5,
    numReviews: 233,
    specs: [
      { label: "Ports", value: "11" },
      { label: "Display", value: "Dual 4K @ 60 Hz" },
      { label: "Power delivery", value: "100 W" },
    ],
  },
  {
    name: "Arc Desk Mat XL",
    brand: "Lumen",
    category: "accessories",
    description: "Premium felt and vegan-leather desk mat with a water-resistant surface. 90 × 40 cm.",
    price: 39,
    stock: 80,
    rating: 4.6,
    numReviews: 610,
    specs: [
      { label: "Size", value: "90 × 40 cm" },
      { label: "Material", value: "Merino felt / PU leather" },
    ],
  },
  {
    name: "Beam 4K Webcam",
    brand: "Halcyon",
    category: "accessories",
    description:
      "4K webcam with AI auto-framing, dual noise-reducing microphones and a privacy shutter.",
    price: 159,
    compareAtPrice: 189,
    stock: 2,
    rating: 4.4,
    numReviews: 145,
    specs: [
      { label: "Resolution", value: "4K @ 30 fps / 1080p @ 60 fps" },
      { label: "Field of view", value: "65°–90° adjustable" },
    ],
  },
  {
    name: "Volt 140W GaN Charger",
    brand: "Aether",
    category: "accessories",
    description: "A pocketable 3-port 140 W GaN charger that powers a laptop, tablet and phone at once.",
    price: 89,
    stock: 50,
    rating: 4.8,
    numReviews: 720,
    specs: [
      { label: "Output", value: "140 W total" },
      { label: "Ports", value: "2 × USB-C, 1 × USB-A" },
    ],
  },
];
