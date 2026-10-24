import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown, Clock3, Menu, Search, Settings2, Sparkles, X } from 'lucide-react'

type Watch = { brand: string; model: string; year: number; reference: string; apiReference?: string; price: number; category: string; creator: string; image: string; description: string; caliber: string; case: string; dial: string; note: string; isLive?: boolean; isRapidApi?: boolean }
type PricePoint = { date: string; price: number }
const categories = ['The icons', 'The pioneers', 'Dress & occasion', 'Field notes']
const archive: Watch[] = [
  { brand: 'Rolex', model: 'Oyster Perpetual', year: 1953, reference: 'Ref. 6084', price: 18450, category: 'The pioneers', creator: 'Hans Wilsdorf & Rolex engineers', image: 'photo-1523170335258-f5ed11844a49', description: 'The watch that made the Oyster a daily companion. A honeycomb dial, an improbable waterproof case, and the quiet confidence of the early fifties.', caliber: 'A.296 · Automatic', case: '36 mm · Steel', dial: 'Champagne honeycomb', note: 'A study in everyday elegance' },
  { brand: 'Patek Philippe', model: 'Calatrava', year: 1932, reference: 'Ref. 96', price: 32100, category: 'Dress & occasion', creator: 'David Penney · commonly attributed', image: 'photo-1524805444758-089113d48a6d', description: 'The original round wristwatch, pared back to its purest expression. Ref. 96 established the enduring Calatrava design language.', caliber: '12-120 · Manual wind', case: '30.5 mm · Yellow gold', dial: 'Silvered opaline', note: 'Form follows feeling' },
  { brand: 'Cartier', model: 'Tank Louis Cartier', year: 1978, reference: 'Ref. 78086', price: 22900, category: 'The icons', creator: 'Louis Cartier · original 1922 design', image: 'photo-1547996160-81dfa63595aa', description: 'A hand-wound Paris-dial Tank Louis, reference 78086, carries Louis Cartier’s 1922 design into the 1970s. Its enduring geometry began with the original Tank.', caliber: '78-1 · Manual wind', case: '23 × 30 mm · Yellow gold', dial: 'Ivory Roman', note: 'An icon that keeps its counsel' },
  { brand: 'Omega', model: 'Speedmaster CK 2998', year: 1959, reference: 'Ref. CK 2998', price: 18600, category: 'The pioneers', creator: 'Claude Baillod · case-design lineage', image: 'photo-1508685096489-7aacd43bd3b1', description: 'The second generation Speedmaster, and the first to travel to space. Its sculpted lugs and alpha hands are pure mid-century optimism.', caliber: '321 · Manual chronograph', case: '39.7 mm · Steel', dial: 'Black step dial', note: 'Made for the long way round' },
  { brand: 'Jaeger-LeCoultre', model: 'Reverso Grande Taille', year: 2000, reference: 'Ref. 270.8.62', price: 11750, category: 'The icons', creator: 'René-Alfred Chauvot · original 1931 case design', image: 'photo-1522312346375-d1a52e2b99b3', description: 'A later Grande Taille expression of the Reverso, whose ingenious swivel case was designed by René-Alfred Chauvot in 1931 for polo players in British India.', caliber: '822 · Manual wind', case: '26 × 41 mm · Steel', dial: 'Silvered guilloché', note: 'A little theatre, beautifully done' },
  { brand: 'Audemars Piguet', model: 'Royal Oak', year: 1972, reference: 'Ref. 5402ST', price: 74600, category: 'The icons', creator: 'Gérald Genta', image: 'photo-1434056886845-dac89ffe9b56', description: 'A steel watch priced like gold, designed like nothing before it. Gérald Genta’s porthole-inspired case changed what a luxury watch could be.', caliber: '2121 · Automatic', case: '39 mm · Steel', dial: 'Petite tapisserie', note: 'The rules were made to be remade' },
  { brand: 'Longines', model: 'Lindbergh Hour Angle', year: 1931, reference: 'Ref. 3210', price: 8650, category: 'The pioneers', creator: 'Charles Lindbergh & Longines', image: 'photo-1614164185128-e4ec99c436d7', description: 'Developed with aviator Charles Lindbergh for celestial navigation. A rotating bezel and central seconds hand made the sky legible.', caliber: '18.69N · Manual wind', case: '47.5 mm · Steel', dial: 'White enamel', note: 'For finding your way home' },
  { brand: 'Rolex', model: 'Submariner', year: 1962, reference: 'Ref. 5512', price: 24800, category: 'Field notes', creator: 'René-Paul Jeanneret & Rolex', image: 'photo-1547996160-81dfa63595aa', description: 'The Submariner found its way from the deep to the city. The four-line chronometer dial on the 5512 marks a high point of useful design.', caliber: '1560 · Automatic', case: '40 mm · Steel', dial: 'Gilt black', note: 'An instrument with manners' },
  { brand: 'Rolex', model: 'Cosmograph Daytona', year: 2023, reference: 'Ref. 126500LN', price: 16400, category: 'The icons', creator: 'Rolex design & engineering team', image: 'photo-1524805444758-089113d48a6d', description: 'A contemporary chapter in a story that began in 1963. The latest steel Daytona keeps the familiar three-register silhouette while refining its movement, case, and proportions.', caliber: '4131 · Automatic chronograph', case: '40 mm · Oystersteel', dial: 'White lacquer', note: 'A modern classic, still in motion' },
]
const periods = ['All years', '1900–1939', '1940–1969', '1970–1999', '2000–today']
const makerCredits = [...new Set(archive.map(w => w.creator))]
const apiImage = archive[0].image
const apiCategory = (model: string) => /submariner|seamaster|diver|superocean|aquaracer|prospex|navitimer|pilot|aviator/i.test(model) ? 'Field notes' : /calatrava|tank|reverso|portofino|master ultra thin|patrimony|santos/i.test(model) ? 'Dress & occasion' : /speedmaster|daytona|royal oak|nautilus|gmt-master|datejust|monaco/i.test(model) ? 'The icons' : 'The pioneers'
const apiWatch = (item: Record<string, unknown>): Watch | null => {
  const firstText = (...values: unknown[]) => values.find((value): value is string => typeof value === 'string' && Boolean(value.trim())) || ''
  const brand = firstText(item.brand, item.make, item.brand_name, item.makeName)
  const model = firstText(item.model, item.name, item.watchName, item.model_name)
  if (!brand || !model) return null
  const rawRef = item.reference_number ?? item.reference ?? item.referenceNumber ?? item.ref ?? item.id
  const ref = rawRef !== undefined && rawRef !== null ? String(rawRef) : `${brand}-${model}`
  const yearText = String(item.year_of_production ?? item.year ?? '').match(/(?:18|19|20)\d{2}/)?.[0]
  const year = yearText ? Number(yearText) : 0
  const diameter = item.case_diameter || item.caseSize || item.diameter
  const material = item.case_material || item.caseMaterial || item.material
  const rawPrice = item.price ?? item.retailPrice ?? item.retail_price
  const price = typeof rawPrice === 'number' ? rawPrice : Number(String(rawPrice ?? '').replace(/[^\d.]/g, '')) || 0
  const image = firstText(item.image, item.imageUrl, item.image_url, item.photo) || apiImage
  const referenceLabel = `API · ${brand} · ${ref}`
  return { brand, model, year, reference: referenceLabel, price, category: apiCategory(model), creator: firstText(item.designer, item.inventor, item.designer_name) || 'Designer attribution not listed by source', image, description: firstText(item.description, item.details) || `${brand} ${model}, supplied by the RapidAPI Watch Database.`, caliber: firstText(item.movement, item.caliber, item.calibre) || 'Not listed', case: `${diameter ? String(diameter).includes('mm') ? String(diameter) : `${String(diameter)} mm` : 'Not listed'}${material ? ` · ${String(material)}` : ''}`, dial: firstText(item.dial, item.dialColor, item.dial_colour) || 'Not listed in API record', note: `Live catalogue record · ${referenceLabel}`, isLive: true, isRapidApi: true }
}
const watchmakerWords = [
  { quote: '“I had a very precise idea in my head and I knew what I wanted to do.”', name: 'Gérald Genta', context: 'On the first Royal Oak prototype · 1970', note: 'Asked to create a steel sports watch unlike anything then on the market, Genta personally followed the prototype from sketch through case development. That night’s design became the Royal Oak, unveiled in 1972.', source: 'https://apchronicles.audemarspiguet.com/en/article/birth-of-an-icon/' },
  { quote: '“Like an oyster, it can remain an unlimited time under water without detriment to its parts.”', name: 'Hans Wilsdorf', context: 'On the name and promise of the Rolex Oyster', note: 'Wilsdorf’s waterproof case reframed the wristwatch as a dependable instrument. Combined a few years later with the Perpetual rotor, the Oyster helped establish the foundations of the modern automatic wristwatch.', source: 'https://www.rolex.com/en-us/oyster-story/visionary-undertaking' },
  { quote: '“We make the best wristwatch in the world.”', name: 'Hans Wilsdorf', context: 'Address to watch retailers · 1927', note: 'Wilsdorf made the declaration while presenting the newly launched Oyster. The confidence was backed by a practical ambition: bring precision and protection to a wristwatch at a time when pocket watches still set the standard.', source: 'https://newsroom.rolex.com/watches/oyster-story/oyster-story' },
  { quote: '“It had all the future and the whole world laid out before it.”', name: 'Hans Wilsdorf', context: 'On the Oyster · 1956', note: 'A founder’s view of a watch designed for a changing world. The Oyster’s legacy grew through real journeys and demanding conditions, from open water to high mountains and long-distance travel.', source: 'https://newsroom.rolex.com/watches/oyster-story/oyster-story' },
]
const watchHistories: Record<string, { chapters: string[]; source: string; sourceName: string }> = {
  'Ref. 6084': { chapters: ['Rolex’s Oyster story began with Hans Wilsdorf’s ambition to make the wristwatch a dependable instrument. The 1926 Oyster case sealed the movement against water and dust; the 1931 Perpetual rotor then used the motion of the wearer’s wrist to wind it. Together, those ideas shaped the modern automatic wristwatch.', 'This 1953 Oyster Perpetual entry belongs to the post-war generation that carried those ideas into everyday life. The softly textured champagne dial and compact steel case give it a quieter character than the later professional models: practical engineering dressed for ordinary hours. Individual vintage examples vary, so condition and originality matter greatly.'], source: 'https://www.rolex.com/en-us/oyster-story/visionary-undertaking', sourceName: 'Rolex · A Visionary Undertaking' },
  'Ref. 96': { chapters: ['Patek Philippe introduced the first Calatrava, reference 96, in 1932. The maison’s own chronology describes it as its first model to bear a reference number and identifies the hand-wound calibre 12-120. Its disciplined round case and restrained dial became a lasting expression of classical watch design.', 'The Calatrava was conceived during a period when modernist design favored clarity and proportion. Ref. 96 translated that spirit into a wristwatch without relying on ornament: a clean circle, balanced markers, and a slim profile. Surviving pieces are collected in many dial and case variations, so each example deserves individual examination.'], source: 'https://static.patek.com/pdf/pressreleases/en/2021_PatekPhilippe_Calatrava_Ref_6119.pdf', sourceName: 'Patek Philippe · Calatrava Ref. 96 chronology' },
  'Ref. 78086': { chapters: ['Louis Cartier created the Tank design in 1917, drawing its geometry from the plan view of a military tank. Its long parallel brancards visually continue the bracelet into the case, making the watch feel like one composed line. The Tank Louis Cartier name belongs to a more refined branch of that family, developed from 1922.', 'Reference 78086 is a later vintage expression of the design, rather than a watch made in 1922. This example is dated circa 1978 and represents the way the Tank’s original architecture was carried forward through changing decades. The rectangular outline, Roman numerals, and cabochon crown preserve its formal character while the movement and proportions identify this particular generation.'], source: 'https://www.cartier.com/en-us/our-style.html', sourceName: 'Cartier · The Tank design' },
  'Ref. CK 2998': { chapters: ['Released in 1959, the CK 2998 was the second generation of the Speedmaster. Its slimmer Alpha hands, symmetrical case, and dark tachymeter bezel gave the chronograph a distinct identity from the 1957 original, while retaining the robust manual-wind Calibre 321.', 'The reference entered space history through astronaut Walter “Wally” Schirra, who bought one for himself and wore it aboard Sigma 7 on 3 October 1962. That flight made the CK 2998 the first Omega watch worn in space. The story began with a personal choice, years before the Speedmaster became standard NASA equipment.'], source: 'https://press.omegawatches.com/the-first-omega-in-space-makes-a-vintage-return/', sourceName: 'Omega · The First Omega in Space' },
  'Ref. 270.8.62': { chapters: ['The Reverso began with a practical challenge from polo-playing British officers in India: protect a watch crystal during a match. Businessman César de Trey worked with Jacques-David LeCoultre and designer René-Alfred Chauvot on a case that slid in its cradle and turned over. Chauvot filed the patent in Paris on 4 March 1931.', 'The blank metal reverse was first a shield for the dial; it soon became a place for personal engravings and decoration. Reference 270.8.62 is a later Grande Taille iteration, not an original 1931 watch. Its modern proportions continue the recognizable reversible case and Art Deco lines of the early design.'], source: 'https://press.jaeger-lecoultre.com/the-genesis-of-reverso/', sourceName: 'Jaeger-LeCoultre · The Genesis of Reverso' },
  'Ref. 5402ST': { chapters: ['Audemars Piguet commissioned Gérald Genta in 1970 after distributors asked for a steel sports watch that felt elegant as well as useful. Genta produced the first sketch overnight. The Royal Oak was unveiled at the Basel fair on 15 April 1972, with an octagonal bezel, exposed screws, integrated bracelet, and a finely textured dial.', 'The first 5402 challenged the price and status expectations of its time: steel was presented with the finishing and value usually associated with precious metal. Early reception was uncertain, but the design established a new vocabulary for the luxury sports watch. The reference shown here is the original 39 mm steel “A-series” family that anchored the collection.'], source: 'https://apchronicles.audemarspiguet.com/en/article/birth-of-an-icon/', sourceName: 'Audemars Piguet · Birth of an Icon' },
  'Ref. 3210': { chapters: ['The Hour Angle watch grew out of aviation’s need to establish position far from landmarks. After Longines timed Charles Lindbergh’s 1927 solo Atlantic crossing, Lindbergh proposed a navigational watch and Longines undertook its production. The design appeared in 1931 as a collaboration between aviator and watchmaker.', 'Its rotating bezel and dedicated angular scales were intended to help pilots work through the celestial-navigation calculations used to determine longitude. The generous dial was functional: it made the information legible in the cockpit and gave the watch its unmistakable instrument-like presence.'], source: 'https://mediacenter.longines.com/the-lindbergh-hour-angle-watch/', sourceName: 'Longines · The Lindbergh Hour Angle Watch' },
  'Ref. 5512': { chapters: ['Rolex introduced the Submariner in 1953 as a purpose-built diver’s watch, initially guaranteed waterproof to 100 metres. Its rotating bezel let divers track elapsed immersion time at a glance. The design brought the sealed Oyster case into a new professional setting and helped define the visual language of the modern dive watch.', 'Reference 5512 belongs to the next phase of that evolution. Introduced in the late 1950s, it added a crown guard and chronometer-certified movement; later examples gained the four-line dial associated with this entry. It reflects the Submariner’s movement from specialist equipment toward a durable everyday watch.'], source: 'https://newsroom.rolex.com/watches/oyster-collection/submariner', sourceName: 'Rolex · Submariner history' },
  'Ref. 126500LN': { chapters: ['The Cosmograph Daytona arrived in 1963 for professional racing drivers. Its tachymetric scale and high-contrast chronograph registers were designed to make elapsed time and average speed easier to read. The name Daytona soon tied the model to the Florida circuit and endurance racing culture.', 'The 2023 steel generation preserves the three-register silhouette while updating the case and movement. It is the contemporary chapter in a line shaped by motorsport, changing chronograph technology, and decades of small design refinements. Though new beside the vintage references in this register, it inherits a clearly recognizable visual language.'], source: 'https://www.rolex.com/watches/cosmograph-daytona/beyond-the-racetrack', sourceName: 'Rolex · Born to Race' },
}
const yearMatches = (year: number, period: string) => period === 'All years' || (period === '1900–1939' && year >= 1900 && year < 1940) || (period === '1940–1969' && year >= 1940 && year < 1970) || (period === '1970–1999' && year >= 1970 && year < 2000) || (period === '2000–today' && year >= 2000)
const money = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
const priceMovement = (points: PricePoint[]) => points.length > 1 ? ((points[points.length - 1].price - points[0].price) / points[0].price) * 100 : null
const imageUrl = (id: string, width = 900) => id.startsWith('https://') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`
const tokenKey = 'heirloom_watch_api_token'
const savedKey = 'heirloom_saved_watches'
const readStoredToken = () => { try { return localStorage.getItem(tokenKey) || '' } catch { return '' } }
const readSavedWatches = () => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(savedKey) || '[]')
    return Array.isArray(saved) ? saved.filter((reference): reference is string => typeof reference === 'string') : []
  } catch { return [] }
}

function App() {
  type Page = 'home' | 'collection' | 'heritage' | 'market'
  const pageFromPath = (): Page => {
    const path = window.location.pathname.replace(/\/$/, '')
    return path === '/collection' || path === '/heritage' || path === '/market' ? path.slice(1) as Page : 'home'
  }
  const [page, setPage] = useState<Page>(pageFromPath)
  const [period, setPeriod] = useState('All years')
  const [category, setCategory] = useState('All chapters')
  const [maker, setMaker] = useState('All makers')
  const [savedOnly, setSavedOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [selected, setSelected] = useState<Watch | null>(null)
  const [saved, setSaved] = useState<string[]>(readSavedWatches)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [token, setToken] = useState(readStoredToken)
  const [tokenDraft, setTokenDraft] = useState(token)
  const [live, setLive] = useState(false)
  const [liveData, setLiveData] = useState<{ name: string }[]>([])
  const [apiWatches, setApiWatches] = useState<Watch[]>([])
  const [apiMessage, setApiMessage] = useState('')
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [historyStatus, setHistoryStatus] = useState('')
  const [sort, setSort] = useState('Curator’s selection')

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setQuoteIndex(index => (index + 1) % watchmakerWords.length), 8000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    try { localStorage.setItem(savedKey, JSON.stringify(saved)) } catch { /* Saved watches remain available until this page closes. */ }
  }, [saved])

  useEffect(() => {
    if (!selected && !settingsOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSelected(null); setSettingsOpen(false) }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected, settingsOpen])

  useEffect(() => {
    setLive(false)
    setLiveData([])
    setApiWatches([])
    setApiMessage('Loading watches from the RapidAPI Watch Database…')
    const controller = new AbortController()
    fetch('/api/watches', { signal: controller.signal })
      .then(async response => {
        const json = await response.json()
        if (!response.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Could not connect to the RapidAPI Watch Database.')
        const records: unknown[] = Array.isArray(json.data) ? json.data : []
        const result = records.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null).map(apiWatch).filter((watch): watch is Watch => watch !== null)
        setApiWatches(result)
        setLive(result.length > 0)
        setLiveData(result.slice(0, 8).map(watch => ({ name: `${watch.brand} ${watch.model}` })))
        setApiMessage(result.length >= 200 ? `RapidAPI connected · ${result.length} real watches loaded` : result.length ? `${result.length} real watch records returned by RapidAPI` : 'No watch records returned. Curated archive remains available.')
      })
      .catch(error => { if (!controller.signal.aborted) { setLive(false); setApiMessage(error instanceof Error ? error.message : 'Could not connect to the RapidAPI Watch Database.') } })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    setPriceHistory([])
    if (!token || !selected || selected.isRapidApi) { setHistoryStatus(''); return }
    const controller = new AbortController()
    setHistoryStatus('Requesting historical market data…')
    const reference = selected.apiReference || selected.reference.replace(/^Ref\.\s*/i, '')
    const params = new URLSearchParams({ api_token: token, reference_number: reference })
    fetch(`https://api.thewatchapi.com/v1/reference/price/history?${params}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('Price history requires an eligible API plan.') ; return r.json() })
      .then(json => {
        const points = (Array.isArray(json.data) ? json.data : []).filter((p: PricePoint) => Number.isFinite(Number(p.price)) && Number(p.price) > 0 && Number.isFinite(Date.parse(p.date))).map((p: PricePoint) => ({ date: p.date, price: Number(p.price) })).reverse()
        if (!points.length) throw new Error('No price history is available for this reference.')
        setPriceHistory(points); setHistoryStatus('Historical asking prices · USD')
      }).catch(e => { if (e.name !== 'AbortError') setHistoryStatus(e.message || 'Historical prices are unavailable.') })
    return () => controller.abort()
  }, [token, selected])

  const watches = useMemo(() => {
    const searchTerm = query.trim().toLowerCase()
    let items = [...archive, ...apiWatches].filter(w => (w.year === 0 || yearMatches(w.year, period)) && (category === 'All chapters' || w.category === category) && (maker === 'All makers' || w.creator === maker) && (!savedOnly || saved.includes(w.reference)) && (!searchTerm || `${w.brand} ${w.model} ${w.reference} ${w.year} ${w.creator} ${w.caliber} ${w.case} ${w.dial} ${w.description} ${w.note} ${watchHistories[w.reference]?.chapters.join(' ') || ''}`.toLowerCase().includes(searchTerm)))
    if (sort === 'Oldest first') items = [...items].sort((a, b) => a.year - b.year)
    if (sort === 'Newest first') items = [...items].sort((a, b) => b.year - a.year)
    if (sort === 'Price: low to high') items = [...items].sort((a, b) => a.price - b.price)
    return items
  }, [period, category, maker, savedOnly, saved, query, sort, apiWatches])

  const toggleSaved = (watch: Watch) => setSaved(prev => prev.includes(watch.reference) ? prev.filter(x => x !== watch.reference) : [...prev, watch.reference])
  const saveToken = () => {
    const nextToken = tokenDraft.trim()
    try { if (nextToken) localStorage.setItem(tokenKey, nextToken); else localStorage.removeItem(tokenKey) } catch { /* Keep the token active for this page even when browser storage is unavailable. */ }
    setToken(nextToken); setSettingsOpen(false)
  }
  const liveMovement = priceMovement(priceHistory)
  const navigate = (nextPage: Page) => {
    window.history.pushState({}, '', nextPage === 'home' ? '/' : `/${nextPage}`)
    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  useEffect(() => {
    const restorePage = () => setPage(pageFromPath())
    window.addEventListener('popstate', restorePage)
    return () => window.removeEventListener('popstate', restorePage)
  }, [])
  useEffect(() => {
    const board = document.querySelector<HTMLElement>('.chess-atmosphere')
    if (!board || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const updatePerspective = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / Math.max(700, document.documentElement.scrollHeight - window.innerHeight), 1)
        board.style.setProperty('--board-tilt', `${59 - progress * 25}deg`)
        board.style.setProperty('--board-turn', `${-9 + progress * 15}deg`)
        board.style.setProperty('--board-drift', `${progress * -5}vh`)
      })
    }
    updatePerspective()
    window.addEventListener('scroll', updatePerspective, { passive: true })
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', updatePerspective) }
  }, [page])

  return <main className="site-shell">
    <div className="checker-edge" aria-hidden="true" />
    {page === 'home' && <div className="chess-atmosphere" aria-hidden="true"><div className="chess-board"><span className="chess-piece piece-a">♞</span><span className="chess-piece piece-b">♜</span><span className="chess-piece piece-c">♟</span><span className="chess-piece piece-d">♝</span><span className="chess-piece piece-e">♙</span><span className="chess-piece piece-f">♘</span><span className="chess-square-label">C · EST. MMXXIV</span></div><div className="chess-glint" /></div>}
    <header className="masthead">
      <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu size={19} /></button>
      <a className="wordmark crest-wordmark" href="/" onClick={event => { event.preventDefault(); navigate('home') }} aria-label="CREST home"><span className="crest-mark" aria-hidden="true"><svg viewBox="0 0 180 88"><path className="horse" d="M8 56l7-17 13-5 7-15 12 4 8-10 10 5 8-3 8 8-3 11 8 6-4 7-10-4-5 13 4 12h-8l-7-14-8-7-8 4-2 17h-7l-2-19-9-7-8 8-2 18h-7l1-22-10-2z"/><path className="horse horse-right" d="M8 56l7-17 13-5 7-15 12 4 8-10 10 5 8-3 8 8-3 11 8 6-4 7-10-4-5 13 4 12h-8l-7-14-8-7-8 4-2 17h-7l-2-19-9-7-8 8-2 18h-7l1-22-10-2z"/><path className="shield" d="M90 7 119 17v24c0 19-12 32-29 42-17-10-29-23-29-42V17z"/><path className="shield-inner" d="M90 13 113 21v20c0 15-9 26-23 35-14-9-23-20-23-35V21z"/><text x="90" y="52" textAnchor="middle">C</text><path className="crest-rule" d="M23 78h45m44 0h45"/></svg></span><span className="crest-name">CREST<small>THE WATCH REGISTER</small></span></a>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation"><a className={page === 'home' ? 'current' : ''} href="/" onClick={event => { event.preventDefault(); navigate('home') }}>The house</a><a className={page === 'collection' ? 'current' : ''} href="/collection" onClick={event => { event.preventDefault(); navigate('collection') }}>The collection</a><a className={page === 'heritage' ? 'current' : ''} href="/heritage" onClick={event => { event.preventDefault(); navigate('heritage') }}>Our heritage</a><a className={page === 'market' ? 'current' : ''} href="/market" onClick={event => { event.preventDefault(); navigate('market') }}>Market notes</a></nav>
      <div className="header-right"><span className="header-edition">EST. IN GOOD TASTE · MMXXIV</span><button className={savedOnly ? 'saved-count active' : 'saved-count'} title={savedOnly ? 'Show all watches' : 'Show saved watches'} aria-pressed={savedOnly} onClick={() => { if (page !== 'collection') navigate('collection'); setSavedOnly(saved.length ? !savedOnly : false) }}><Bookmark size={15} /> <span>{saved.length.toString().padStart(2, '0')}</span></button></div>
    </header>
    {menuOpen && <button className="nav-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}

    <section className="hero" id="top" style={{ display: page === 'home' ? undefined : 'none' }}>
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> An archive of time, considered <span className="eyebrow-line" /></div>
        <h1>Some things<br />are <em>worth</em><br /><span>keeping.</span></h1>
        <p className="hero-description">A considered collection of watches with stories to tell. Made to outlast a moment, and to mean a little more with every passing year.</p>
        <a href="/collection" onClick={event => { event.preventDefault(); navigate('collection') }} className="hero-cta">Explore the register <ArrowDown size={15} /></a>
        <div className="hero-aside"><span className="aside-rule" /> <span>THE ART OF<br />KEEPING TIME</span></div>
      </div>
      <div className="hero-visual"><div className="hero-gloss" /><img src={imageUrl('photo-1523170335258-f5ed11844a49', 1400)} alt="An illustrative archival-style photograph of a vintage wristwatch" onError={event => { event.currentTarget.style.opacity = '0' }} /><div className="hero-photo-caption"><span>A STUDY IN STEEL · THE ARCHIVE</span><ArrowUpRight size={15} /></div><div className="hero-stamp"><span>TIME WELL<br />KEPT</span><b>H</b><small>VOL. I · 2024</small></div></div>
      <div className="hero-bottom"><span>AN EDITED GUIDE TO THE EXCEPTIONAL</span><span className="hero-bottom-center">— &nbsp;THE COLLECTOR’S REGISTER&nbsp; —</span><span>1900 &nbsp;—&nbsp; TODAY</span></div>
    </section>

    <section className="manifesto" id="story" style={{ display: page === 'heritage' || page === 'home' ? undefined : 'none' }}><div className="manifesto-kicker"><span>001 / A POINT OF VIEW</span><span className="tiny-flower">✳</span></div><h2>Time has a <em>memory.</em></h2><p><em>Wear a story on your wrist.</em> Keep a little of yesterday close, and let tomorrow find its own hour.</p><span className="manifesto-watermark">C</span></section>

    <section className="quote-ledger" aria-live="polite" style={{ display: page === 'heritage' || page === 'home' ? undefined : 'none' }}><div className="quote-seal">THE MAKERS’<br />OWN WORDS</div><div className="quote-slide" key={quoteIndex}><blockquote>{watchmakerWords[quoteIndex].quote}</blockquote><p className="quote-note">{watchmakerWords[quoteIndex].note}</p><cite>— {watchmakerWords[quoteIndex].name}<small>{watchmakerWords[quoteIndex].context}</small><a href={watchmakerWords[quoteIndex].source} target="_blank" rel="noreferrer">Read the original source ↗</a></cite></div><div className="quote-controls"><button onClick={() => setQuoteIndex(index => (index - 1 + watchmakerWords.length) % watchmakerWords.length)} aria-label="Previous quotation"><ArrowLeft size={14} /></button><span className="quote-counter">0{quoteIndex + 1} / 0{watchmakerWords.length}</span><button onClick={() => setQuoteIndex(index => (index + 1) % watchmakerWords.length)} aria-label="Next quotation"><ArrowRight size={14} /></button></div></section>

    <section className="collection-section" id="collection" style={{ display: page === 'collection' ? undefined : 'none' }}><div className="section-heading"><div><div className="eyebrow left"><span className="eyebrow-line" /> THE REGISTER</div><h2>Time, <em>well spent.</em></h2></div><p>Each reference has a past.<br />These are a few worth knowing.</p></div>
      <div className="filters"><div className="filter-periods">{periods.map(p => <button key={p} className={period === p ? 'period active' : 'period'} onClick={() => setPeriod(p)}>{p}</button>)}</div><div className="filter-tools"><label className={`search-box ${searchFocused ? 'search-focused' : ''}`}><Search size={15} /><input aria-label="Search watches, makers, and specifications" placeholder="Search watches, makers, specs…" value={query} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} onChange={e => setQuery(e.target.value)} />{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}</label><button className="icon-button settings-button" aria-label="API settings" onClick={() => { setTokenDraft(token); setSettingsOpen(true) }}><Settings2 size={17} /></button></div></div>
      {query && <div className="search-feedback" key={query}><span className="search-pulse" /> {watches.length ? <><b>{watches.length}</b> {watches.length === 1 ? 'entry' : 'entries'} found for <em>“{query}”</em></> : <>No entries found for <em>“{query}”</em></>}</div>}
      <div className="collection-subhead"><div className="category-tabs"><button className={category === 'All chapters' ? 'cat active' : 'cat'} onClick={() => setCategory('All chapters')}>All chapters <span>{String(archive.length + apiWatches.length).padStart(3, '0')}</span></button>{categories.map(c => <button key={c} className={category === c ? 'cat active' : 'cat'} onClick={() => setCategory(c)}>{c} <span>{String(archive.filter(w => w.category === c).length + apiWatches.filter(w => w.category === c).length).padStart(2, '0')}</span></button>)}</div><button className="sort-button" onClick={() => setSort(sort === 'Curator’s selection' ? 'Oldest first' : sort === 'Oldest first' ? 'Newest first' : sort === 'Newest first' ? 'Price: low to high' : 'Curator’s selection')}>{sort} <ChevronDown size={14} /></button></div>
      <div className="maker-filter"><span>THE MAKERS</span><button className={maker === 'All makers' ? 'maker-chip selected' : 'maker-chip'} onClick={() => setMaker('All makers')}>All</button>{makerCredits.map(name => <button key={name} className={maker === name ? 'maker-chip selected' : 'maker-chip'} onClick={() => setMaker(name)}>{name}</button>)}</div>
      <div className="watch-grid" key={`${query}-${maker}-${period}-${category}-${savedOnly}`}>{watches.map((watch, index) => <article className={`watch-card ${index === 0 ? 'featured-card' : ''}`} key={watch.reference} tabIndex={0} aria-label={`Open ${watch.brand} ${watch.model} details`} onClick={() => setSelected(watch)} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); setSelected(watch) } }}>
        <button className={saved.includes(watch.reference) ? 'save-watch saved' : 'save-watch'} onClick={e => { e.stopPropagation(); toggleSaved(watch) }} aria-label={saved.includes(watch.reference) ? 'Remove from saved' : 'Save watch'}>{saved.includes(watch.reference) ? <Check size={15} /> : <Bookmark size={15} />}</button>
        <div className="watch-photo"><img src={imageUrl(watch.image, 900)} alt={`${watch.brand} ${watch.model} — illustrative archival-style photograph`} loading="lazy" onError={event => { event.currentTarget.style.opacity = '0' }} /><span className="photo-index">{watch.isLive ? 'LIVE API' : `NO. ${String(index + 1).padStart(2, '0')}`}</span><span className="watch-year">{watch.year || 'UNDATED'}</span></div>
        <div className="watch-meta"><span className="watch-brand">{watch.brand}</span><span className="watch-category">{watch.category.toUpperCase()}</span></div><h3>{watch.model}</h3><div className="watch-ref">{watch.reference} <span>·</span> {watch.note}</div><div className="watch-card-credit"><small>DESIGN / INVENTION CREDIT</small><span>{watch.creator}</span></div><div className="watch-specs"><span>{watch.caliber}</span><span>{watch.case}</span><span>{watch.dial}</span></div><div className="watch-price"><div><small>{watch.isLive ? 'API PRICE DATA' : 'ILLUSTRATIVE ESTIMATE'}</small><strong>{watch.price ? money(watch.price) : 'Not supplied'}</strong></div></div>
      </article>)}</div>
      {watches.length === 0 && <div className="empty-state"><Clock3 /><p>{savedOnly && saved.length === 0 ? 'Your register is empty. Save a watch to keep it here.' : 'No watches match these filters in the current chapter.'}</p><button onClick={() => { setPeriod('All years'); setCategory('All chapters'); setMaker('All makers'); setSavedOnly(false); setQuery('') }}>Return to the full register</button></div>}
      <div className="register-footer"><span>SHOWING {String(watches.length).padStart(3, '0')} OF {String(archive.length + apiWatches.length).padStart(3, '0')} REFERENCES</span><span className="footer-flourish">❧</span><button onClick={() => { setPeriod('All years'); setCategory('All chapters'); setMaker('All makers'); setSavedOnly(false); setQuery('') }}>View the entire register <ArrowRight size={15} /></button></div>
    </section>

    <section className="story-band" id="journal" style={{ display: page === 'heritage' || page === 'home' ? undefined : 'none' }}><div className="story-image"><img src={imageUrl('photo-1508685096489-7aacd43bd3b1', 1100)} alt="An illustrative vintage chronograph photograph" loading="lazy" onError={event => { event.currentTarget.style.opacity = '0' }} /><div className="story-image-label">NOTES FROM THE ARCHIVE · NO. 04</div></div><div className="story-copy"><div className="eyebrow left"><span className="eyebrow-line" /> FROM THE FIELD NOTES</div><span className="story-date">A SHORT HISTORY · 1957–1962</span><h2>From the racetrack<br />to <em>orbit.</em></h2><p>Omega introduced the Speedmaster in 1957 as a chronograph for motorsport. Five years later, astronaut Walter Schirra wore his CK 2998 aboard Sigma 7—the first Omega watch in space. A timing instrument found a new horizon.</p><button className="text-link" onClick={() => navigate('collection')}>Read the field notes <ArrowUpRight size={15} /></button><span className="story-index">04</span></div></section>

    {page === 'market' && <section className="market-intro"><div className="market-copy"><div className="eyebrow left"><span className="eyebrow-line" /> THE MARKET LEDGER</div><h1>Every reference has<br /><em>its own measure.</em></h1><p>We pair the story behind each watch with a clear view of its estimated market value. Live catalogue and price history can be connected below.</p><button onClick={() => navigate('collection')}>Explore the collection <ArrowRight size={15} /></button></div><LiveDominoClock /></section>}
    <section className="api-note" style={{ display: page === 'market' ? undefined : 'none' }}><div className="api-icon"><Sparkles size={19} /></div><div><span className="eyebrow left">A LIVING ARCHIVE</span><p>Market estimates, thoughtfully gathered.<br /><small>{live ? `${apiMessage} · historical pricing available in eligible plans` : token ? apiMessage : 'Illustrative estimates shown · connect a data source for current model records'}</small></p>{liveData.length > 0 && <div className="api-live-results">LIVE CATALOGUE: {liveData.map(item => item.name).join(' · ')}</div>}</div><button onClick={() => { setTokenDraft(token); setSettingsOpen(true) }}> {live ? 'API connected' : 'Connect market data'} <ArrowUpRight size={14} /></button></section>

    <footer className="footer"><div className="footer-top"><a className="wordmark footer-wordmark crest-wordmark" href="/" onClick={event => { event.preventDefault(); navigate('home') }}><span className="crest-mark" aria-hidden="true"><svg viewBox="0 0 180 88"><path className="horse" d="M8 56l7-17 13-5 7-15 12 4 8-10 10 5 8-3 8 8-3 11 8 6-4 7-10-4-5 13 4 12h-8l-7-14-8-7-8 4-2 17h-7l-2-19-9-7-8 8-2 18h-7l1-22-10-2z"/><path className="horse horse-right" d="M8 56l7-17 13-5 7-15 12 4 8-10 10 5 8-3 8 8-3 11 8 6-4 7-10-4-5 13 4 12h-8l-7-14-8-7-8 4-2 17h-7l-2-19-9-7-8 8-2 18h-7l1-22-10-2z"/><path className="shield" d="M90 7 119 17v24c0 19-12 32-29 42-17-10-29-23-29-42V17z"/><path className="shield-inner" d="M90 13 113 21v20c0 15-9 26-23 35-14-9-23-20-23-35V21z"/><text x="90" y="52" textAnchor="middle">C</text><path className="crest-rule" d="M23 78h45m44 0h45"/></svg></span><span className="crest-name">CREST<small>THE WATCH REGISTER</small></span></a><p>For the things we keep,<br />and the time we give them.</p><div className="footer-links"><a href="/collection" onClick={event => { event.preventDefault(); navigate('collection') }}>The collection</a><a href="/heritage" onClick={event => { event.preventDefault(); navigate('heritage') }}>Our heritage</a><a href="/market" onClick={event => { event.preventDefault(); navigate('market') }}>Market notes</a></div><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="back-top">BACK TO THE TOP ↑</button></div><div className="footer-bottom"><span>© {new Date().getFullYear()} CREST WATCH REGISTER</span><span>MADE WITH TIME IN MIND</span><span>AN INDEPENDENT EDITORIAL ARCHIVE</span></div></footer>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="watch-modal" role="dialog" aria-modal="true" aria-label={`${selected.brand} ${selected.model} details`} onClick={e => e.stopPropagation()}><button className="modal-close icon-button" onClick={() => setSelected(null)} aria-label="Close"><X size={19} /></button><div className="modal-image"><img src={imageUrl(selected.image, 1000)} alt={`${selected.brand} ${selected.model} — illustrative archival-style photograph`} onError={event => { event.currentTarget.style.opacity = '0' }} /></div><div className="modal-content"><button className="back-link" onClick={() => setSelected(null)}><ArrowLeft size={14} /> BACK TO THE REGISTER</button><div className="eyebrow left"><span className="eyebrow-line" /> {selected.category.toUpperCase()}</div><span className="modal-date">{selected.year || 'Year not listed'} · {selected.reference}</span><h2>{selected.brand}<br /><em>{selected.model}</em></h2><p>{selected.description}</p>{watchHistories[selected.reference] && <section className="history-detail"><div className="eyebrow left"><span className="eyebrow-line" /> THE STORY IN TIME</div><h3>A history of {selected.model}</h3>{watchHistories[selected.reference].chapters.map((chapter, index) => <p key={index}>{chapter}</p>)}<a href={watchHistories[selected.reference].source} target="_blank" rel="noreferrer">Read {watchHistories[selected.reference].sourceName} <ArrowUpRight size={12} /></a></section>}<div className="modal-credit"><small>DESIGN / INVENTION CREDIT</small><span>{selected.creator}</span></div><div className="spec-list"><div><span>CALIBRE</span><b>{selected.caliber}</b></div><div><span>CASE</span><b>{selected.case}</b></div><div><span>DIAL</span><b>{selected.dial}</b></div></div><div className="modal-value"><div><small>{priceHistory.length ? 'LATEST API ASKING PRICE' : selected.isRapidApi ? 'RAPIDAPI LIST PRICE' : selected.isLive ? 'API PRICE HISTORY' : 'ILLUSTRATIVE MARKET ESTIMATE'}</small><strong>{priceHistory.length ? money(priceHistory[priceHistory.length - 1].price) : selected.price ? money(selected.price) : 'Not supplied'}</strong></div>{liveMovement !== null && <span className="watch-change">{liveMovement >= 0 ? '↗' : '↘'} {liveMovement.toFixed(1)}% <small>PERIOD</small></span>}</div>{priceHistory.length > 1 && <PriceChart points={priceHistory} />}<p className="market-disclaimer">{historyStatus || (selected.isLive ? 'Live catalogue data. Price history depends on your API plan and the reference.' : 'Illustrative estimate. Market prices vary by condition, provenance, and market.')}</p><button className="modal-save" onClick={() => toggleSaved(selected)}>{saved.includes(selected.reference) ? <Check size={15} /> : <Bookmark size={15} />}{saved.includes(selected.reference) ? 'Saved to your register' : 'Keep in your register'}</button></div></div></div>}
    {settingsOpen && <div className="modal-backdrop settings-backdrop" onClick={() => setSettingsOpen(false)}><div className="settings-modal" role="dialog" aria-modal="true" aria-label="Market data settings" onClick={e => e.stopPropagation()}><button className="modal-close icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close"><X size={18} /></button><div className="eyebrow left"><span className="eyebrow-line" /> RAPIDAPI WATCH DATABASE</div><h2>Connect the <em>archive.</em></h2><p>Real watch records load from RapidAPI using the server-side key in <code>.env.local</code>. The optional token below is only for historical price charts.</p><label className="token-label">THEWATCHAPI PRICE-HISTORY TOKEN<input value={tokenDraft} onChange={e => setTokenDraft(e.target.value)} placeholder="Optional TheWatchAPI token" type="password" /></label><div className="api-settings-note"><span className={live ? 'status-dot online' : 'status-dot'} /> {live ? 'RapidAPI catalogue connected' : 'RapidAPI catalogue is not connected'}<a href="https://rapidapi.com/makingdatameaningful/api/watch-database1" target="_blank" rel="noreferrer">Watch Database listing <ArrowUpRight size={12} /></a></div>{apiMessage && <div className="api-feedback">{apiMessage}</div>}<button className="connect-button" onClick={saveToken}>Save price-history token <ArrowRight size={15} /></button>{token && <button className="disconnect-button" onClick={() => { setTokenDraft(''); try { localStorage.removeItem(tokenKey) } catch { /* Disconnect still works for this page. */ } setToken(''); setSettingsOpen(false) }}>Clear price-history token</button>}<p className="api-fineprint">RapidAPI catalogue data is fetched through the local server proxy. Historical asking-price charts remain optional and require a separate TheWatchAPI plan/token.</p></div></div>}
    <div className="live-data-sr" aria-live="polite">{live && liveData.length > 0 ? `Live data available for ${liveData.map(x => x.name).join(', ')}` : ''}</div>
  </main>
}

function LiveDominoClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours()
  const localTime = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now)
  // Clockwise from 12: each domino's two halves add up to its hour marker.
  const markers = [[6, 6], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5], [5, 6]]
  const pipPositions: Record<number, string[]> = { 0: [], 1: ['center'], 2: ['top-left', 'bottom-right'], 3: ['top-left', 'center', 'bottom-right'], 4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'], 5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'], 6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'] }
  const hourAngle = (hours % 12) * 30 + minutes * 0.5
  const minuteAngle = minutes * 6 + seconds * 0.1
  const secondAngle = seconds * 6
  return <div className="clock-display"><div className="domino-clock" role="img" aria-label={`Wooden domino clock showing ${localTime}`}><div className="domino-clock-grain" />{markers.map((halves, index) => <div className="domino-marker" key={index} style={{ '--marker-angle': `${index * 30}deg` } as CSSProperties} aria-hidden="true"><span className="domino-half">{pipPositions[halves[0]].map(pip => <i className={`pip ${pip}`} key={pip} />)}</span><span className="domino-divider" /><span className="domino-half">{pipPositions[halves[1]].map(pip => <i className={`pip ${pip}`} key={pip} />)}</span></div>)}<div className="clock-inscription">CREST · KEEPING TIME</div><div className="clock-hand hour-hand" style={{ transform: `rotate(${hourAngle}deg)` }} /><div className="clock-hand minute-hand" style={{ transform: `rotate(${minuteAngle}deg)` }} /><div className="clock-hand second-hand" style={{ transform: `rotate(${secondAngle}deg)` }} /><div className="clock-pin" /><span className="clock-signature">C</span></div><div className="clock-readout"><span>LOCAL TIME</span><time dateTime={now.toISOString()}>{localTime}</time></div></div>
}

function PriceChart({ points }: { points: PricePoint[] }) {
  const recent = points.slice(-48)
  const values = recent.map(p => p.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const coords = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${32 - ((v - min) / range) * 27}`).join(' ')
  return <div className="price-chart"><div><span>PRICE HISTORY</span><span>{recent.length} RECORDS</span></div><svg viewBox="0 0 100 36" preserveAspectRatio="none" role="img" aria-label="Historical asking price chart"><polyline points={coords} fill="none" stroke="#843d32" strokeWidth=".8" vectorEffect="non-scaling-stroke" /></svg><div><span>{new Date(recent[0].date).getFullYear()}</span><span>{new Date(recent[recent.length - 1].date).getFullYear()}</span></div></div>
}

export default App

