/* =============================================================
   LUNA-OS // i18n — NL/EN op basis van browsertaal + switcher
   Gedeeld door index.html en remote.html. Pure vanilla JS.
   - data-i18n="key"            → element.innerHTML = vertaling
   - data-i18n-attr="attr:key"  → element.setAttribute(attr, vertaling)
   - window.LUNA.lang / t(key) / apply() / setLang(l)
   ============================================================= */
(() => {
  "use strict";

  const STORE = "luna-lang";

  function detect() {
    try {
      const s = localStorage.getItem(STORE);
      if (s === "nl" || s === "en") return s;
    } catch (e) {}
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "nl";
    return /^nl/i.test(nav) ? "nl" : "en";
  }

  const DICT = {
    nl: {
      "meta.title": `Gefeliciteerd Michael 🎉 // LUNA-OS v25.0`,
      "meta.desc": `Officieel verjaardagsprotocol voor Michael Ullers (25). Cadeau gematerialiseerd door de Lunafilament-reactor, omdat het doelwit het 'niet wist' (en wat hij wél wist te duur was).`,

      "hud.status": `verjaardagsprotocol actief`,
      "hud.pair": `⇆ telefoon koppelen`,
      "boot.skip": `[ skip // ik heb geen geduld, net als altijd ]`,

      "hero.eyebrow": `LUNA-OS // verjaardagsprotocol 25.0`,
      "hero.title1": `GEFELICITEERD`,
      "hero.age.unit": `jaar oud`,
      "hero.age.status": `STATUS: JARIG`,
      "hero.age.since": `officieel sinds 3 juni`,
      "hero.age.celebrated": `gevierd: vandaag (beter laat dan&nbsp;nooit)`,
      "hero.sub": `Een kwart eeuw oud, vers gepromoveerd tot teamleider bij de Kruidvat, en op de vraag wat je wilt hebben nog steeds maar één antwoord: <b>"geen idee, ik weet het niet"</b>. (En wéét je het een keer wél, dan is het iets onbetaalbaars.) Scroll maar; je gamet straks toch weer tot 3 uur 's nachts op zolder.`,
      "hero.cue": `scroll om te ontcijferen`,

      "dossier.eyebrow": `Subject dossier // geclassificeerd (niet echt)`,
      "dossier.title": `WIE IS HET <span class="accent-c">DOELWIT</span>`,
      "dossier.lead": `Het systeem heeft een volledige scan uitgevoerd. De resultaten waren grotendeels voorspelbaar.`,
      "dossier.scan.placeholder": `// geen beeld geladen<br />subject weigert te poseren<br />(of zegt "doe maar dinges")`,
      "dossier.scan.note": `<span class="tag">⚠ scan-detectie // object herkend</span> Nep-banaan (rubber, verdacht zwaar) gedetecteerd in mond van subject. <b>Herkomst getraceerd:</b> cadeau van operator, ±2 jaar geleden. Status: nóg steeds trots in gebruik. Dat is, eerlijk gezegd, meer waardering dan de meeste échte cadeaus ooit krijgen. Petje af, broertje.`,

      "spec.name.k": `Naam`,
      "spec.name.v": `Michael Ullers`,
      "spec.alias.k": `Alias`,
      "spec.alias.v": `"kech" <span class="hl">(familie-uitgave, uitsluitend met liefde)</span>`,
      "spec.age.k": `Leeftijd`,
      "spec.age.v": `25 <span class="hl">(update 24 → 25 geslaagd)</span>`,
      "spec.job.k": `Beroep`,
      "spec.job.v": `teamleider @ Kruidvat <span class="hl">(voorheen kassa-slet @ Albert Heijn)</span>`,
      "spec.work.k": `Werk-modus`,
      "spec.work.v": `roept sinds de promotie standaard <span class="hl">"1 plus 1 gratis, man"</span>`,
      "spec.habitat.k": `Habitat`,
      "spec.habitat.v": `de zolder — zie neveneffect`,
      "spec.side.k": `Bekend neveneffect`,
      "spec.side.v": `de <span class="hl">zoldervloek</span>: langdurig op zolder slapen → geleidelijke buik-expansie. Wetenschappelijk onbewezen, familiair bevestigd.`,
      "spec.vocab.k": `Vocabulaire`,
      "spec.vocab.v": `valt terug op <span class="hl">"dinges"</span> zodra een woord even niet komt`,
      "spec.gift.k": `Cadeaubeleid`,
      "spec.gift.v": `standaardantwoord: <span class="hl">"ik weet het niet"</span>`,
      "spec.exc.k": `Uitzondering`,
      "spec.exc.v": `wéét hij het wél, dan is het te duur: <span class="hl">een SSD of RAM</span> — prijzen de pan uit sinds AI alles opkocht`,
      "spec.threat.k": `Bedreigingsniveau`,
      "spec.threat.v": `laag (tenzij je tussen hem en de Doritos gaat staan)`,

      "stat.years": `jaar succesvol geladen`,
      "stat.hints": `bruikbare cadeauhints ontvangen`,
      "stat.dinges": `keer "dinges" gezegd (lopende schatting)`,

      "dilemma.eyebrow": `Foutrapport // jaarlijks terugkerend`,
      "dilemma.title": `HET CADEAU-<span class="accent-m">DILEMMA</span>`,
      "dilemma.p1": `Elk jaar weer hetzelfde ritueel. We vragen het netjes. We geven ruimte voor input. We bieden zelfs <b>meerkeuze</b> aan.`,
      "dilemma.p2": `En elk jaar weer hetzelfde resultaat: hij <b class="accent-m">weet het niet</b>. En in het zeldzame geval dat hij het wél weet, blijkt het iets onbetaalbaars — een <b class="accent-c">SSD of meer RAM</b>, waarvan de prijzen sinds de AI-hausse richting de maan zijn geschoten. Toepasselijk, gezien waar dit cadeau zich afspeelt.`,
      "dilemma.p3": `Dus werd, na uitvoerig beraad (lees: zuchten), het <b class="accent-c">noodprotocol "Broer Beslist"</b> geactiveerd.`,
      "chat.tag": `transcript // jaar na jaar`,
      "chat.who.me": `operator (ik)`,
      "chat.who.him": `michael`,
      "chat.me1": `Hey, wat wil je eigenlijk voor je verjaardag?`,
      "chat.him1": `Geen idee man, ik weet het niet`,
      "chat.me2": `Oké… denk even na. Echt íéts?`,
      "chat.him2": `Nou… misschien een SSD. Of meer RAM`,
      "chat.me3": `…die kosten nu een nier per gigabyte. Bedankt, AI.`,
      "chat.him3": `OH WACHT MISCHIEN EHHH… dinges...`,
      "chat.sys": `⚠ FOUT — wens onbekend OF onbetaalbaar. Noodprotocol "Broer Beslist" geactiveerd.`,

      "gift.eyebrow": `Output // het cadeau materialiseert`,
      "gift.title": `DE <span class="accent-a">LUNAFILAMENT</span>-REACTOR`,
      "gift.lead": `In <b class="accent-c">PRAGMATA</b> kun je met "Lunafilament" zowat alles 3D-printen — mits je over de juiste data beschikt. Wij hadden geen data (input: "ik weet het niet"), en het enige concrete verzoek was te duur. Dus de reactor heeft het zélf maar uitgezocht. Even geduld…`,
      "reactor.idle": `// reactor in slaapstand…`,
      "gift.desc": `Een sci-fi actie-avontuur van <b>Capcom</b>. Spacefarer <b>Hugh</b> en de mysterieuze android <b>Diana</b> zitten vast op een verlaten maanstation dat is overgenomen door een vijandige AI. Jij bestuurt ze allebei tegelijk: Hugh schiet, Diana hackt de vijanden open. Samenwerken dus — een concept dat je dit jaar op cadeaugebied duidelijk niet wist toe te passen.`,
      "chip.action": `Sci-fi actie`,
      "chip.moon": `Maanstation`,
      "chip.positive": `97% positief`,
      "chip.release": `release 17 apr 2026`,
      "gift.steam": `▶ Bekijk je cadeau op Steam`,
      "gift.fineprint": `* Helaas geen 1 plus 1 gratis, man. Eén exemplaar per jarige.`,

      "why.eyebrow": `Rechtvaardiging // waarom uitgerekend dit`,
      "why.title": `WAAROM <span class="accent-c">PRAGMATA</span>`,
      "why.lead": `Voor het geval je twijfelt aan de keuze die jij zelf hebt geweigerd te maken, hier de onderbouwing van het comité.`,
      "why.1.h": `Het gaat over ontsnappen`,
      "why.1.p": `Hugh en Diana proberen te ontsnappen van de maan. Jij ontsnapt al 25 jaar aan de simpele vraag "wat wil je hebben?". Thematisch dus zéér herkenbaar materiaal.`,
      "why.2.h": `Twee personages, één brein`,
      "why.2.p": `Je stuurt Hugh én Diana tegelijk aan — schieten én hacken in één beweging. Multitasken op hoog niveau. Iets wat je bij het uitkiezen van cadeaus aantoonbaar niet beheerst.`,
      "why.3.h": `Het is van Capcom`,
      "why.3.p": `De makers van Resident Evil en Monster Hunter. 97% van de Steam-reviews is positief. Statistisch gezien een véél veiligere gok dan jou laten beslissen.`,
      "why.4.h": `Je gamet jezelf tóch al een ongeluk`,
      "why.4.p": `Assassin's Creed, Genshin Impact, Crimson Desert — tot diep in de nacht, op zolder. PRAGMATA past naadloos in die toch al licht zorgwekkende levensstijl. Beschouw het als brandstof voor de zoldervloek.`,
      "why.5.h": `Eindelijk eens een goed verhaal`,
      "why.5.p": `Een filmisch, doordacht sci-fi verhaal met echte personages en een hoop sfeer — uitgewerkt met meer detail dan jij ooit in een cadeauwens hebt gestopt. Grote kans dat je het naderhand kunt navertellen in échte woorden, in plaats van "eh… dinges".`,
      "why.6.h": `Geen banaan, geen onbetaalbare RAM`,
      "why.6.p": `Je kreeg van mij ooit al een rubberen banaan (die je blijkbaar nog dagelijks gebruikt). Een SSD of RAM kost dankzij AI inmiddels meer dan een kleine auto. Dit is het gulden midden: een écht cadeau dat je maandenlang gaat gebruiken, en dat geen rubber is. Graag gedaan.`,

      "outro.eyebrow": `// einde transmissie`,
      "outro.title": `FIJNE VERJAARDAG,<br /><span class="accent-m">MICHAEL</span>`,
      "outro.msg": `Even serieus, tussen alle sarcasme door: <span class="accent-m">gefeliciteerd met je 25e, broertje.</span> Kassa-legende geworden, doorgegroeid tot teamleider, en uitgegroeid tot iemand die ik voor geen goud had willen missen — ook al maak je het kiezen van een cadeau elk jaar onnodig ingewikkeld. Geniet van PRAGMATA, kom af en toe van die zolder af, en zeg volgend jaar gewoon even wat je wilt. "Ik weet het niet" en "dinges" tellen allebei niet.`,
      "outro.party": `🎉 Laat het feest los`,
      "outro.sign": `// met liefde en lichte irritatie — <b>je broers Jeffrey en Wesley</b>`,

      "footer.text": `LUNA-OS v25.0 &nbsp;•&nbsp; gebouwd met te veel moeite door <b>één broer</b> &nbsp;•&nbsp; geen sokken werden geschonken tijdens deze productie &nbsp;•&nbsp; `,
      "footer.konami": `tip: probeer eens ↑↑↓↓←→←→BA`,

      "pair.tag": `remote koppelen`,
      "pair.title": `Bedien dit scherm<br />met je telefoon`,
      "pair.hint": `Scan met je telefooncamera, of open de link:`,
      "pair.codeLabel": `room-code:`,
      "pair.warn": `⚠ Op <b>localhost</b> of een lokaal bestand kan je telefoon dit niet openen. Zet de site online (GitHub&nbsp;Pages) of serveer 'm op je netwerk-IP.`,
      "pair.status.idle": `● remote-server starten…`,
      "pair.close": `sluiten`,

      "rc.brand.sub": `afstandsbediening`,
      "rc.status.init": `niet verbonden`,
      "rc.group.pair": `koppelen met scherm`,
      "rc.room.btn": `verbind`,
      "rc.group.sections": `ga naar sectie`,
      "rc.sec.hero": `🚀 Start`,
      "rc.sec.dossier": `🛰️ Dossier`,
      "rc.sec.dilemma": `⚠️ Dilemma`,
      "rc.sec.gift": `🎁 Cadeau`,
      "rc.sec.why": `💡 Waarom`,
      "rc.sec.outro": `🎂 Slot`,
      "rc.group.scroll": `scroll — sleep met je vinger ↕`,
      "rc.pad.hint": `sleep ↕ om te scrollen<small>klein duwtje = beetje · snelle veeg = veel</small>`,
      "rc.page.up": `<span class="em">▲</span> pagina omhoog`,
      "rc.page.down": `<span class="em">▼</span> pagina omlaag`,
      "rc.group.fx": `animaties &amp; effecten`,
      "rc.fx.confetti": `<span class="em">🎉</span> Confetti`,
      "rc.fx.fireworks": `<span class="em">🎆</span> Vuurwerk`,
      "rc.fx.party": `<span class="em">🥳</span> Feest!`,
      "rc.fx.warp": `<span class="em">🌌</span> Warp`,
      "rc.fx.shake": `<span class="em">💥</span> Shake`,
      "rc.fx.reveal": `<span class="em">🎁</span> Onthul cadeau`,
      "rc.fx.skip": `<span class="em">⏭</span> Skip intro`,
      "rc.foot.init": `verbind met het scherm om te besturen`,
    },

    en: {
      "meta.title": `Happy Birthday Michael 🎉 // LUNA-OS v25.0`,
      "meta.desc": `Official birthday protocol for Michael Ullers (25). Gift materialised by the Lunafilament reactor, because the target "didn't know" (and what he did want was too expensive).`,

      "hud.status": `birthday protocol active`,
      "hud.pair": `⇆ connect phone`,
      "boot.skip": `[ skip // I've got no patience, as usual ]`,

      "hero.eyebrow": `LUNA-OS // birthday protocol 25.0`,
      "hero.title1": `HAPPY BIRTHDAY`,
      "hero.age.unit": `years old`,
      "hero.age.status": `STATUS: BIRTHDAY BOY`,
      "hero.age.since": `officially since June 3rd`,
      "hero.age.celebrated": `celebrated: today (better late than&nbsp;never)`,
      "hero.sub": `A quarter of a century old, freshly promoted to team lead at Kruidvat, and still only one answer to the question of what you want: <b>"no idea, I dunno"</b>. (And on the rare occasion you do know, it's something unaffordable.) Go ahead and scroll; you'll be gaming till 3am in the attic again anyway.`,
      "hero.cue": `scroll to decrypt`,

      "dossier.eyebrow": `Subject dossier // classified (not really)`,
      "dossier.title": `WHO IS THE <span class="accent-c">TARGET</span>`,
      "dossier.lead": `The system ran a full scan. The results were largely predictable.`,
      "dossier.scan.placeholder": `// no image loaded<br />subject refuses to pose<br />(or says "just do, uh, dinges")`,
      "dossier.scan.note": `<span class="tag">⚠ scan detection // object recognised</span> Fake banana (rubber, suspiciously heavy) detected in subject's mouth. <b>Origin traced:</b> gift from operator, ±2 years ago. Status: still proudly in use. Which is, honestly, more appreciation than most real gifts ever get. Hats off, little brother.`,

      "spec.name.k": `Name`,
      "spec.name.v": `Michael Ullers`,
      "spec.alias.k": `Alias`,
      "spec.alias.v": `"kech" <span class="hl">(family edition, strictly with love)</span>`,
      "spec.age.k": `Age`,
      "spec.age.v": `25 <span class="hl">(update 24 → 25 successful)</span>`,
      "spec.job.k": `Job`,
      "spec.job.v": `team lead @ Kruidvat <span class="hl">(formerly checkout slut @ Albert Heijn)</span>`,
      "spec.work.k": `Work mode`,
      "spec.work.v": `since the promotion, defaults to shouting <span class="hl">"buy one get one free, man"</span>`,
      "spec.habitat.k": `Habitat`,
      "spec.habitat.v": `the attic — see side effect`,
      "spec.side.k": `Known side effect`,
      "spec.side.v": `the <span class="hl">attic curse</span>: sleeping in the attic long-term → gradual belly expansion. Scientifically unproven, family-confirmed.`,
      "spec.vocab.k": `Vocabulary`,
      "spec.vocab.v": `falls back on <span class="hl">"dinges"</span> <span class="gloss">(Dutch for "thingy" / "whatchamacallit")</span> the moment a word escapes him`,
      "spec.gift.k": `Gift policy`,
      "spec.gift.v": `default answer: <span class="hl">"I dunno"</span>`,
      "spec.exc.k": `Exception`,
      "spec.exc.v": `when he does know, it's too pricey: <span class="hl">an SSD or RAM</span> — prices through the roof ever since AI bought up everything`,
      "spec.threat.k": `Threat level`,
      "spec.threat.v": `low (unless you stand between him and the Doritos)`,

      "stat.years": `years successfully loaded`,
      "stat.hints": `usable gift hints received`,
      "stat.dinges": `times "dinges" said (running estimate)`,

      "dilemma.eyebrow": `Error report // recurring annually`,
      "dilemma.title": `THE GIFT <span class="accent-m">DILEMMA</span>`,
      "dilemma.p1": `The same ritual every year. We ask nicely. We leave room for input. We even offer <b>multiple choice</b>.`,
      "dilemma.p2": `And the same result every year: he <b class="accent-m">doesn't know</b>. And in the rare case he does, it turns out to be something unaffordable — an <b class="accent-c">SSD or more RAM</b>, whose prices have shot toward the moon since the AI boom. Fitting, given where this gift takes place.`,
      "dilemma.p3": `So, after extensive deliberation (read: sighing), <b class="accent-c">emergency protocol "Brother Decides"</b> was activated.`,
      "chat.tag": `transcript // year after year`,
      "chat.who.me": `operator (me)`,
      "chat.who.him": `michael`,
      "chat.me1": `Hey, what do you actually want for your birthday?`,
      "chat.him1": `No idea man, I dunno`,
      "chat.me2": `Okay… think for a sec. Literally anything?`,
      "chat.him2": `Well… maybe an SSD. Or more RAM`,
      "chat.me3": `…those cost a kidney per gigabyte now. Thanks, AI.`,
      "chat.him3": `OH WAIT MAYBE UHHH… dinges...`,
      "chat.sys": `⚠ ERROR — wish unknown OR unaffordable. Emergency protocol "Brother Decides" activated.`,

      "gift.eyebrow": `Output // the gift materialises`,
      "gift.title": `THE <span class="accent-a">LUNAFILAMENT</span> REACTOR`,
      "gift.lead": `In <b class="accent-c">PRAGMATA</b> you can 3D-print almost anything from "Lunafilament" — provided you have the right data. We had no data (input: "I dunno"), and the only concrete request was too expensive. So the reactor sorted it out itself. One moment…`,
      "reactor.idle": `// reactor in standby…`,
      "gift.desc": `A sci-fi action adventure from <b>Capcom</b>. Spacefarer <b>Hugh</b> and the mysterious android <b>Diana</b> are stranded on an abandoned lunar station overrun by a hostile AI. You control them both at once: Hugh shoots, Diana hacks enemies open. Teamwork, in other words — a concept you clearly failed to apply to gift-giving this year.`,
      "chip.action": `Sci-fi action`,
      "chip.moon": `Lunar station`,
      "chip.positive": `97% positive`,
      "chip.release": `releases Apr 17, 2026`,
      "gift.steam": `▶ View your gift on Steam`,
      "gift.fineprint": `* Sadly not buy-one-get-one-free, man. One copy per birthday boy.`,

      "why.eyebrow": `Justification // why this exactly`,
      "why.title": `WHY <span class="accent-c">PRAGMATA</span>`,
      "why.lead": `In case you doubt the choice you yourself refused to make, here's the committee's reasoning.`,
      "why.1.h": `It's about escaping`,
      "why.1.p": `Hugh and Diana are trying to escape the moon. You've spent 25 years escaping the simple question "what do you want?". Thematically, very relatable material.`,
      "why.2.h": `Two characters, one brain`,
      "why.2.p": `You control both Hugh and Diana at once — shooting and hacking in one motion. High-level multitasking. Something you demonstrably can't manage when picking gifts.`,
      "why.3.h": `It's by Capcom`,
      "why.3.p": `The makers of Resident Evil and Monster Hunter. 97% of Steam reviews are positive. Statistically a far safer bet than letting you decide.`,
      "why.4.h": `You game yourself silly anyway`,
      "why.4.p": `Assassin's Creed, Genshin Impact, Crimson Desert — deep into the night, in the attic. PRAGMATA slots seamlessly into that already mildly worrying lifestyle. Consider it fuel for the attic curse.`,
      "why.5.h": `Finally, a proper story`,
      "why.5.p": `A cinematic, well-thought-out sci-fi story with real characters and plenty of atmosphere — crafted with more detail than you've ever put into a gift wish. Good chance you'll be able to retell it afterwards in actual words, instead of "uh… dinges".`,
      "why.6.h": `No banana, no unaffordable RAM`,
      "why.6.p": `I once gave you a rubber banana (which you apparently still use daily). An SSD or RAM now costs more than a small car thanks to AI. This is the happy medium: a real gift you'll use for months, and that isn't made of rubber. You're welcome.`,

      "outro.eyebrow": `// end of transmission`,
      "outro.title": `HAPPY BIRTHDAY,<br /><span class="accent-m">MICHAEL</span>`,
      "outro.msg": `In all seriousness, beneath all the sarcasm: <span class="accent-m">happy 25th, little brother.</span> Became a checkout legend, grew into a team lead, and grew into someone I wouldn't trade for anything — even if you make choosing a gift needlessly complicated every year. Enjoy PRAGMATA, come down from that attic now and then, and next year just tell us what you want. "I dunno" and "dinges" both don't count.`,
      "outro.party": `🎉 Unleash the party`,
      "outro.sign": `// with love and mild irritation — <b>your brothers Jeffrey and Wesley</b>`,

      "footer.text": `LUNA-OS v25.0 &nbsp;•&nbsp; built with too much effort by <b>one brother</b> &nbsp;•&nbsp; no socks were gifted during this production &nbsp;•&nbsp; `,
      "footer.konami": `tip: try ↑↑↓↓←→←→BA`,

      "pair.tag": `pair remote`,
      "pair.title": `Control this screen<br />with your phone`,
      "pair.hint": `Scan with your phone camera, or open the link:`,
      "pair.codeLabel": `room code:`,
      "pair.warn": `⚠ Your phone can't open this on <b>localhost</b> or a local file. Put the site online (GitHub&nbsp;Pages) or serve it on your network IP.`,
      "pair.status.idle": `● starting remote server…`,
      "pair.close": `close`,

      "rc.brand.sub": `remote control`,
      "rc.status.init": `not connected`,
      "rc.group.pair": `pair with screen`,
      "rc.room.btn": `connect`,
      "rc.group.sections": `go to section`,
      "rc.sec.hero": `🚀 Start`,
      "rc.sec.dossier": `🛰️ Dossier`,
      "rc.sec.dilemma": `⚠️ Dilemma`,
      "rc.sec.gift": `🎁 Gift`,
      "rc.sec.why": `💡 Why`,
      "rc.sec.outro": `🎂 End`,
      "rc.group.scroll": `scroll — drag with your finger ↕`,
      "rc.pad.hint": `drag ↕ to scroll<small>small nudge = a little · quick swipe = a lot</small>`,
      "rc.page.up": `<span class="em">▲</span> page up`,
      "rc.page.down": `<span class="em">▼</span> page down`,
      "rc.group.fx": `animations &amp; effects`,
      "rc.fx.confetti": `<span class="em">🎉</span> Confetti`,
      "rc.fx.fireworks": `<span class="em">🎆</span> Fireworks`,
      "rc.fx.party": `<span class="em">🥳</span> Party!`,
      "rc.fx.warp": `<span class="em">🌌</span> Warp`,
      "rc.fx.shake": `<span class="em">💥</span> Shake`,
      "rc.fx.reveal": `<span class="em">🎁</span> Reveal gift`,
      "rc.fx.skip": `<span class="em">⏭</span> Skip intro`,
      "rc.foot.init": `connect to the screen to control it`,
    },
  };

  let lang = detect();

  function t(key) {
    const d = DICT[lang] || DICT.nl;
    if (d[key] != null) return d[key];
    return DICT.nl[key] != null ? DICT.nl[key] : "";
  }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang;

    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.getAttribute("data-i18n"));
      if (v !== "") el.innerHTML = v;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split(",").forEach((pair) => {
        const parts = pair.split(":");
        const attr = (parts[0] || "").trim();
        const key = (parts[1] || "").trim();
        const v = t(key);
        if (attr && v !== "") el.setAttribute(attr, v);
      });
    });

    const title = t("meta.title");
    if (title) document.title = title;
    const desc = t("meta.desc");
    const m = document.querySelector('meta[name="description"]');
    if (m && desc) m.setAttribute("content", desc);

    root.querySelectorAll("[data-lang-btn]").forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-lang-btn") === lang);
    });
  }

  function setLang(l) {
    if (l !== "nl" && l !== "en") return;
    lang = l;
    try { localStorage.setItem(STORE, l); } catch (e) {}
    apply(document);
    window.dispatchEvent(new CustomEvent("luna:lang", { detail: { lang: lang } }));
  }

  window.LUNA = {
    get lang() { return lang; },
    t: t,
    apply: apply,
    setLang: setLang,
  };

  // klik-delegatie voor de taalswitcher (werkt ook als knoppen later komen)
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("[data-lang-btn]");
    if (b) { e.preventDefault(); setLang(b.getAttribute("data-lang-btn")); }
  });

  // zo vroeg mogelijk toepassen (de boot-overlay verbergt de swap op index.html)
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => apply(document));
  else apply(document);
})();
