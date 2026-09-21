/**TCD Campus Map - Buildings Data
 FOR ADMIN:
 * Each building entry contains:
 id- unique slug identifier
 name- display name
 shortDesc- brief description for map popup
 hours- opening hours (if applicable)
 categories  - array of category keys (see CATEGORIES below)
 coords- [latitude, longitude] — adjust via https://www.latlong.net/
image - path to building image (replace placeholder when ready)
 pageUrl  - link to individual building subpage (add when subpages are built)
 
 CATEGORIES: academic | student-services | administrative | heritage | facilities | accessibility
 */
const CATEGORIES = {
  academic: {
    label: "Academic",
    colour: "#1A6BB5",
  },
  
  "student-services": {
    label: "Student Services",
    colour: "#8B2FC9",
  },

  administrative: {
    label: "Administrative",
    colour: "#0E8A6E",
  },

  heritage: {
    label: "Heritage and Cultural",
    colour: "#6B3FA0",
  },

  facilities: {
    label: "Facilities",
    colour: "#C97A1A",
  },

  accessibility: {
    label: "Accessibility",
    colour: "#C0392B",
  },
};

const BUILDINGS = [
  /* A --------------*/
  {
    id: "academic-registry",
    name: "Academic Registry",
    shortDesc: "Central hub for student academic records, exam administration and graduation ceremonies.",
    hours: "Mon-Fri 09:00-17:00",
    categories: ["student-services", "administrative"],
    coords: [53.342944,-6.250911],
    image: "images/academic.registry.jpg",
    pageUrl: "AR.html",
  },

  {
    id: "aras-an-phiarsaigh",
    name: "Aras an Phiarsaigh",
    shortDesc: "Administrative building housing several college offices and departments.",
    hours: "Mon-Fri 09:00-17:00",
    categories: ["student-services", "administrative"],
    coords: [53.344660,-6.255181],
    image: "images/arasanp.jpg",
    pageUrl: "#placeholder-aras-an-phiarsaigh",
  },

  {
    id: "arts-building",
    name: "Arts Building",
    shortDesc: "Home to humanities and social sciences departments. Houses the Disability Service and Equality, Diversity and Inclusion office on level 2 (Room 2054).",
    hours: "Mon-Fri 08:00-22:00",
    categories: ["academic", "accessibility"],
    coords: [53.343369,-6.257405],
    image: "images/arts.jpg",
    pageUrl: "artsbuilding.html",
  },

  /* B */
  {
    id: "berkeley-library",
    name: "Berkeley Library",
    shortDesc: "The main college library offering extensive collections, study spaces and digital resources.",
    hours: "Mon-Fri 08:00-22:00 | Sat-Sun 10:00-18:00",
    categories: ["academic"],
    coords: [53.343670,-6.255982],
    image: "images/bekerley.jpg",
    pageUrl: "berkeleylibrary.html",
  },

  {
    id: "tbsi",
    name: "Biomedical Sciences Institute (TBSI)",
    shortDesc: "State-of-the-art research facility focused on translational biomedical science.",
    hours: "Mon-Fri 08:00-18:00",
    categories: ["academic"],
    coords: [53.343569,-6.247320],
    image: "images/tbsi.jpg",
    pageUrl: "biomedical-sciences-institute.html",
  },

  {
    id: "buttery",
    name: "Buttery",
    shortDesc: "Popular campus cafe and social hub serving food and drinks throughout the day.",
    hours: "Mon-Fri 08:00-20:00",
    categories: ["facilities"],
    coords: [53.344953,-6.257343],
    image: "images/buttery.jpg",
    pageUrl: "Buttery.html",
  },

  /* C */
  {
    id: "campanile",
    name: "Campanile",
    shortDesc: "Trinity's iconic 30-metre bell tower, the symbolic centrepiece of Front Square.",
    hours: "Accessible during campus open hours",
    categories: ["heritage"],
    coords: [53.344397,-6.257293],
    image: "images/campanile.jpg",
    pageUrl: "campanile.html",
  },

  {
    id: "chapel",
    name: "Chapel",
    shortDesc: "A beautifully preserved 18th-century chapel used for services and ceremonies.",
    hours: "Daily 08:00-18:00",
    categories: ["heritage"],
    coords: [53.344611,-6.258066],
    image: "images/chapel.jpg",
    pageUrl: "chapel.html",
  },

  /* D */
  {
    id: "students-hall",
    name: "Students Union",
    shortDesc: "The official representative body for all 20,000+ students at Trinity College Dublin.",
    hours: "Mon-Fri 09:00-17:00",
    categories: ["student-services"],
    coords: [53.344700,-6.258873],
    image: "images/students.union.jpg",
    pageUrl: "Studentunion.html",
  },

  /* E */
  {
    id: "exam-hall",
    name: "Exam Hall (Public Theatre)",
    shortDesc: "The Examination Hall, also known as the Public Theatre, hosts exams and major ceremonies.",
    hours: "Event-dependent",
    categories: ["heritage", "administrative"],
    coords: [53.344213,-6.258091],
    image: "images/exam.hall.jpg",
    pageUrl: "Examhall.html",
  },

  /* H */
  {
    id: "hamilton-building",
    name: "Hamilton Building",
    shortDesc: "Modern building housing mathematics and computer science departments.",
    hours: "Mon-Fri 08:00-18:00",
    categories: ["academic"],
    coords: [53.343374,-6.250392],
    image: "images/hamilton.jpg",
    pageUrl: "hamilton.html",
  },

  {
    id: "hamilton-library",
    name: "Hamilton Library",
    shortDesc: "Specialist library supporting science and engineering faculties.",
    hours: "Mon-Fri 09:00-21:00 | Sat 10:00-17:00",
    categories: ["academic"],
    coords: [53.343374,-6.250392],
    image: "images/hamilton.library.jpg",
    pageUrl: "hamilton-library.html",
  },

  {
    id: "lloyd-institute",
    name: "Lloyd Institute",
    shortDesc: "Houses the School of Computer Science and Statistics.",
    hours: "Mon-Fri 08:00-18:00",
    categories: ["academic"],
    coords: [53.343781,-6.250843],
    image: "images/lloyd.jpg",
    pageUrl: "Lloyd.html",
  },

  /* M */
  {
    id: "museum-building",
    name: "Museum Building",
    shortDesc: "Victorian Venetian-Gothic gem housing geology, engineering and natural history collections.",
    hours: "Mon-Fri 09:00-17:00",
    categories: ["academic", "heritage"],
    coords: [53.343939,-6.255243],
    image: "images/museum.building.jpg",
    pageUrl: "museum-building.html",
  },

  /* O--------------- */
  {
    id: "old-library",
    name: "Old Library",
    shortDesc: "Early 18th-century library renowned for its magnificent Long Room housing the Book of Kells.",
    hours: "09:30-17:00 | Mon-Sun",
    categories: ["heritage"],
    coords: [53.343885,-6.256840],
    image: "images/old.library.jpg",
    pageUrl: "#placeholder-old-library",
  },

  {
    id: "oreilly-institute",
    name: "O'Reilly Institute",
    shortDesc: "Houses research groups in computer science, electronics and telecommunications.",
    hours: "Mon-Fri 08:00-18:00",
    categories: ["academic"],
    coords: [53.343417,-6.250379],
    image: "images/oreilly.jpg",
    pageUrl: "oreilly-institute.html",
  },

/* P */
  {
    id: "pavilion-bar",
    name: "Pavilion Bar (The Pav)",
    shortDesc: "Beloved outdoor bar and social venue overlooking the cricket pitch on College Park.",
    hours: "Mon-Fri 12:00-23:00 | Sat 12:00-22:00",
    categories: ["facilities"],
    coords: [53.342706,-6.252990],
    image: "images/pav.jpg",
    pageUrl: "PavilionBar.html",
  },

  {
    id: "printing-house-square",
    name: "Printing House Square",
    shortDesc: "Home to the disAbility Service hub, supporting students with disabilities across campus.",
    hours: "Mon-Fri 09:00-17:00",
    categories: ["student-services", "accessibility"],
    coords: [53.345046,-6.255467],
    image: "images/printing.jpg",
    pageUrl: "printing-house-square.html",
  },

  {
    id: "provosts-house",
    name: "Provost's House",
    shortDesc: "Official residence of the Provost of Trinity College, a fine Georgian mansion.",
    hours: "Not open to the public",
    categories: ["administrative", "heritage"],
    coords: [53.344436,-6.258983],
    image: "images/provosts.jpg",
    pageUrl: "provosts-house.html",
  },

  /* R */
  {
    id: "regent-house",
    name: "Regent House",
    shortDesc: "The ceremonial entrance to Trinity College, used for formal college occasions.",
    hours: "Mon-Fri 09:00-17:00",
    categories: ["administrative"],
    coords: [53.344442,-6.258809],
    image: "images/regent.jpg",
    pageUrl: "regent-house.html",
  },

  /* S */
  {
    id: "samuel-beckett-theatre",
    name: "Samuel Beckett Theatre",
    shortDesc: "Purpose-built theatre hosting drama productions, performances and cultural events.",
    hours: "Event-dependent",
    categories: ["heritage"],
    coords: [53.344673,-6.254339],
    image: "images/samuel.beckett.jpg",
    pageUrl: "SamuelBeckett.html",
  },

  {
    id: "sports-centre",
    name: "Sports Centre",
    shortDesc: "Modern sports complex offering gym facilities, courts and a wide range of fitness classes.",
    hours: "Mon-Fri 07:00-22:00 | Sat-Sun 09:00-20:00",
    categories: ["facilities"],
    coords: [53.343939,-6.250348],
    image: "images/sports.jpg",
    pageUrl: "SportsCenter.html",
  },

  /* T */
  {
    id: "trinity-business-school",
    name: "Trinity Business School",
    shortDesc: "Award-winning modern building housing business education and research at Trinity.",
    hours: "Mon-Fri 08:00-22:00",
    categories: ["academic"],
    coords: [53.344170,-6.251870],
    image: "images/business.school.jpg",
    pageUrl: "trinity-business-school.html",
  }
  
];

/* Make available globally */
if (typeof module !== "undefined") {
  module.exports = { BUILDINGS, CATEGORIES };
}


