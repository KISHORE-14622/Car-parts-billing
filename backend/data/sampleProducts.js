const sampleProducts = [
  {
    name: "Brake Pads - Front Set",
    barcode: "1234567890123",
    description: "High-performance ceramic brake pads for front wheels. Provides excellent stopping power and reduced brake dust.",
    category: "Brake System",
    price: 89.99,
    stock: 25,
    manufacturer: "Brembo",
    partNumber: "BP-FRONT-001",
    compatibility: [
      { make: "Toyota", model: "Camry", year: "2018-2023" },
      { make: "Honda", model: "Accord", year: "2018-2022" }
    ],
    image: "/images/brake-pads-front.jpg",
    specifications: {
      weight: "2.5 kg",
      dimensions: "25cm x 15cm x 3cm",
      material: "Ceramic composite",
      warranty: "2 years"
    }
  },
  {
    name: "Engine Oil Filter",
    barcode: "2345678901234",
    description: "Premium oil filter for optimal engine protection. Removes contaminants and extends engine life.",
    category: "Filters",
    price: 24.99,
    stock: 50,
    manufacturer: "Mann Filter",
    partNumber: "OF-ENG-002",
    compatibility: [
      { make: "Ford", model: "F-150", year: "2015-2023" },
      { make: "Chevrolet", model: "Silverado", year: "2014-2022" }
    ],
    image: "/images/oil-filter.jpg",
    specifications: {
      weight: "0.8 kg",
      dimensions: "12cm x 8cm x 8cm",
      material: "Paper and metal",
      warranty: "1 year"
    }
  },
  {
    name: "Spark Plugs Set (4 pieces)",
    barcode: "3456789012345",
    description: "Iridium spark plugs for improved fuel efficiency and engine performance. Set of 4 plugs.",
    category: "Engine Parts",
    price: 45.99,
    stock: 30,
    manufacturer: "NGK",
    partNumber: "SP-IRD-003",
    compatibility: [
      { make: "Nissan", model: "Altima", year: "2016-2023" },
      { make: "Mazda", model: "CX-5", year: "2017-2023" }
    ],
    image: "/images/spark-plugs.jpg",
    specifications: {
      weight: "0.3 kg",
      dimensions: "10cm x 5cm x 5cm",
      material: "Iridium",
      warranty: "3 years"
    }
  },
  {
    name: "Air Filter",
    barcode: "4567890123456",
    description: "High-flow air filter for improved engine breathing and performance. Washable and reusable.",
    category: "Filters",
    price: 35.99,
    stock: 40,
    manufacturer: "K&N",
    partNumber: "AF-HF-004",
    compatibility: [
      { make: "BMW", model: "3 Series", year: "2012-2020" },
      { make: "Audi", model: "A4", year: "2013-2021" }
    ],
    image: "/images/air-filter.jpg",
    specifications: {
      weight: "0.5 kg",
      dimensions: "30cm x 20cm x 5cm",
      material: "Cotton gauze",
      warranty: "10 years"
    }
  },
  {
    name: "Timing Belt",
    barcode: "5678901234567",
    description: "Durable timing belt for precise engine timing. Essential for engine operation and longevity.",
    category: "Belts & Hoses",
    price: 65.99,
    stock: 20,
    manufacturer: "Gates",
    partNumber: "TB-TIM-005",
    compatibility: [
      { make: "Honda", model: "Civic", year: "2006-2015" },
      { make: "Acura", model: "TSX", year: "2004-2014" }
    ],
    image: "/images/timing-belt.jpg",
    specifications: {
      weight: "0.7 kg",
      dimensions: "100cm x 3cm x 1cm",
      material: "Rubber with fiber reinforcement",
      warranty: "2 years"
    }
  },
  {
    name: "Radiator",
    barcode: "6789012345678",
    description: "Aluminum radiator for efficient engine cooling. Direct fit replacement with improved heat dissipation.",
    category: "Cooling System",
    price: 189.99,
    stock: 15,
    manufacturer: "Mishimoto",
    partNumber: "RAD-ALU-006",
    compatibility: [
      { make: "Subaru", model: "WRX", year: "2015-2021" },
      { make: "Subaru", model: "STI", year: "2015-2021" }
    ],
    image: "/images/radiator.jpg",
    specifications: {
      weight: "8.5 kg",
      dimensions: "60cm x 40cm x 5cm",
      material: "Aluminum",
      warranty: "3 years"
    }
  },
  {
    name: "Shock Absorber - Rear",
    barcode: "7890123456789",
    description: "Gas-filled shock absorber for smooth ride quality and improved handling. Rear fitment.",
    category: "Suspension",
    price: 125.99,
    stock: 18,
    manufacturer: "Bilstein",
    partNumber: "SA-REAR-007",
    compatibility: [
      { make: "Mercedes-Benz", model: "C-Class", year: "2014-2021" },
      { make: "Mercedes-Benz", model: "E-Class", year: "2016-2023" }
    ],
    image: "/images/shock-absorber.jpg",
    specifications: {
      weight: "3.2 kg",
      dimensions: "45cm x 8cm x 8cm",
      material: "Steel with gas filling",
      warranty: "2 years"
    }
  },
  {
    name: "Headlight Assembly - LED",
    barcode: "8901234567890",
    description: "LED headlight assembly with improved brightness and energy efficiency. Direct replacement.",
    category: "Electrical",
    price: 299.99,
    stock: 12,
    manufacturer: "Philips",
    partNumber: "HL-LED-008",
    compatibility: [
      { make: "Volkswagen", model: "Golf", year: "2015-2021" },
      { make: "Volkswagen", model: "Jetta", year: "2019-2023" }
    ],
    image: "/images/led-headlight.jpg",
    specifications: {
      weight: "2.8 kg",
      dimensions: "35cm x 25cm x 15cm",
      material: "Polycarbonate and aluminum",
      warranty: "5 years"
    }
  },
  {
    name: "Exhaust Muffler",
    barcode: "9012345678901",
    description: "Performance exhaust muffler for improved sound and flow. Stainless steel construction.",
    category: "Exhaust System",
    price: 159.99,
    stock: 22,
    manufacturer: "Borla",
    partNumber: "EX-MUF-009",
    compatibility: [
      { make: "Ford", model: "Mustang", year: "2015-2023" },
      { make: "Chevrolet", model: "Camaro", year: "2016-2023" }
    ],
    image: "/images/exhaust-muffler.jpg",
    specifications: {
      weight: "6.5 kg",
      dimensions: "50cm x 20cm x 15cm",
      material: "Stainless steel",
      warranty: "3 years"
    }
  },
  {
    name: "Transmission Filter Kit",
    barcode: "0123456789012",
    description: "Complete transmission filter kit with gasket and fluid. Ensures smooth transmission operation.",
    category: "Transmission",
    price: 75.99,
    stock: 28,
    manufacturer: "ATP",
    partNumber: "TF-KIT-010",
    compatibility: [
      { make: "Toyota", model: "RAV4", year: "2013-2022" },
      { make: "Lexus", model: "NX", year: "2015-2023" }
    ],
    image: "/images/transmission-filter.jpg",
    specifications: {
      weight: "1.5 kg",
      dimensions: "25cm x 20cm x 8cm",
      material: "Paper and rubber",
      warranty: "2 years"
    }
  }
];

module.exports = sampleProducts;
