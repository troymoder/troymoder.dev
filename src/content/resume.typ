#set page(
  paper: "a4",
  margin: 0.8in,
)

#set text(
  font: "JetBrains Mono",
  size: 10pt,
  fill: rgb("#1a1a1a"),
)

#set par(
  leading: 0.65em * 1.3,
  justify: false,
)

#show heading: set text(weight: "bold")

#let link-color = rgb("#0055aa")
#let gray-color = rgb("#666666")

#show link: set text(fill: link-color)

#let section-title(title) = {
  v(1.2em)
  text(size: 0.9em, fill: gray-color, upper(title))
  v(0.5em)
}

// === HEADER ===
#text(size: 2em, weight: "bold")[Troy Benson]
#v(0.3em)
#text(size: 1.2em)[Software Engineer]

#v(0.6em)
#link("mailto:me@troymoder.dev")[me\@troymoder.dev] · #link("https://github.com/troykomodo")[github.com/troykomodo] · #link("https://troymoder.dev")[troymoder.dev]

#v(0.6em)
#line(length: 100%, stroke: 0.8pt)

// === SKILLS ===
#section-title("skills")

Rust · C · Nix · Bazel · Kubernetes

// === EXPERIENCE ===
#section-title("experience")

#box[#link("https://paravision.ai")[*Paravision, Inc.*]] · Software Engineer #h(1fr) #text(size: 0.9em)[2022 – present]
#list(
  marker: [–],
  indent: 1em,
  body-indent: 0.5em,
  [Rewrote core services, built CI/CD pipelines],
)

#v(0.5em)

#box[#link("https://7tv.app")[*7TV*]] · CTO & Co-Founder #h(1fr) #text(size: 0.9em)[2021 – 2025]
#list(
  marker: [–],
  indent: 1em,
  body-indent: 0.5em,
  [Scaled from zero to \$1M ARR],
  [3PB served, 50B requests/month],
)

#v(0.5em)

#box[#link("https://storyxpress.co")[*StoryXpress*]] · Software Engineer #h(1fr) #text(size: 0.9em)[2021 – 2022]
#list(
  marker: [–],
  indent: 1em,
  body-indent: 0.5em,
  [Led live streaming product architecture],
)

// === OPEN SOURCE ===
#section-title("open source")

#link("https://github.com/scufflecloud")[*Scuffle*] – Open source video cloud

#v(0.4em)

#link("https://github.com/troymoder/bolt")[*bolt*] – Starlark build system

#v(0.4em)

#link("https://github.com/troymoder/crates/tree/main/tinc")[*tinc*] – gRPC-REST transcoding for Rust

#v(0.4em)

#link("https://github.com/troymoder/crates/tree/main/postcompile")[*postcompile*] – Generated code testing for Rust

#v(0.4em)

#link("https://github.com/troymoder/brawl")[*brawl*] – GitHub merge queue bot

#v(2em)
#line(length: 100%, stroke: 0.4pt)
#v(0.8em)

#align(center)[
  #text(size: 0.9em, fill: gray-color)[Referrals available upon request]
]
