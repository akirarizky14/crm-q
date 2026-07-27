export interface LandingContent {
  hero: {
    eyebrow: string
    headline: string
    subheadline: string
    ctaLabel: string
    ctaWhatsapp: string
  }
  contact: {
    whatsapp: string
    email: string
    address: string
    hours: string
  }
}

export const defaultLandingContent: LandingContent = {
  hero: {
    eyebrow: 'Wedding & Corporate Fleet',
    headline: 'Sewa mobil bulanan untuk momen dan bisnis Anda.',
    subheadline:
      'Crown Car Rental melayani sewa mobil bulanan untuk pernikahan dan kebutuhan operasional perusahaan — armada terawat, pengemudi berpengalaman, kontrak fleksibel.',
    ctaLabel: 'Konsultasi via WhatsApp',
    ctaWhatsapp: 'https://wa.me/6281234567890',
  },
  contact: {
    whatsapp: '+62 812 3456 7890',
    email: 'halo@crowncarrental.id',
    address: 'Jl. Kebon Jeruk Raya No. 88, Jakarta Barat',
    hours: 'Senin – Sabtu, 08.00 – 20.00 WIB',
  },
}

export interface PackagePlan {
  id: string
  name: string
  audience: string
  monthlyPrice: string
  features: string[]
  highlighted?: boolean
}

export const packages: PackagePlan[] = [
  {
    id: 'p-wedding',
    name: 'Wedding Package',
    audience: 'Untuk pernikahan & prewedding',
    monthlyPrice: 'Mulai Rp 22.500.000/bulan',
    features: [
      'Mobil pengantin (Alphard, Mercedes S-Class, dll)',
      'Dekorasi mobil sesuai tema',
      'Sopir berpengalaman & berseragam',
      'Fleksibel untuk acara akad & resepsi',
    ],
    highlighted: true,
  },
  {
    id: 'p-corporate',
    name: 'Corporate Monthly',
    audience: 'Untuk operasional perusahaan',
    monthlyPrice: 'Mulai Rp 14.500.000/bulan',
    features: [
      'Van & bus untuk shuttle karyawan',
      'Kontrak sewa bulanan, bisa diperpanjang',
      'Maintenance & pajak ditanggung Crown',
      'Laporan penggunaan armada bulanan',
    ],
  },
  {
    id: 'p-event',
    name: 'Event & Gathering',
    audience: 'Untuk acara korporat & gathering',
    monthlyPrice: 'Mulai Rp 52.000.000/bulan',
    features: [
      'Bus pariwisata kapasitas besar',
      'Cocok untuk gathering tahunan & tamu VIP',
      'Estimasi rute & jadwal disiapkan tim kami',
      'Opsi sewa harian di dalam periode bulanan',
    ],
  },
]

export interface Testimonial {
  id: string
  name: string
  role: string
  quote: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't-1',
    name: 'Amanda Wijaya',
    role: 'Pengantin, Jakarta',
    quote:
      'Mobil pengantin dari Crown Car Rental datang tepat waktu dan dekorasinya persis seperti yang kami mau. Sangat membantu di hari besar kami.',
  },
  {
    id: 't-2',
    name: 'Dimas Aditya',
    role: 'Operations Manager, PT Nusantara Jaya',
    quote:
      'Kontrak sewa bulanan armada shuttle karyawan kami jauh lebih rapi sejak pakai Crown — laporan bulanan jelas, mobil selalu prima.',
  },
  {
    id: 't-3',
    name: 'Intan Permata',
    role: 'Wedding Organizer',
    quote:
      'Sebagai WO kami sering rekomendasikan Crown ke klien. Tim responsif dan pilihan armadanya lengkap untuk wedding maupun gathering korporat.',
  },
]
