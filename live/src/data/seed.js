import { addDays, mulberry32, pick, randInt, todayISO } from "./../lib/format.js";
/* ------------------------------------------------------------------ */
/* Geography — simulated Gauteng map space (0–100 x, 0–100 y)          */
/* ------------------------------------------------------------------ */
export const HUB = { name: "City Deep Hub", x: 56, y: 63, code: "HUB-JHB-01" };
export const SUBURBS = [
    { name: "Johannesburg CBD", x: 48, y: 53, zone: "Johannesburg South" },
    { name: "Braamfontein", x: 45, y: 48, zone: "Johannesburg South" },
    { name: "Johannesburg South", x: 50, y: 74, zone: "Johannesburg South" },
    { name: "City Deep", x: 56, y: 63, zone: "Johannesburg South" },
    { name: "Sandton", x: 60, y: 30, zone: "Sandton / Rosebank" },
    { name: "Rosebank", x: 52, y: 38, zone: "Sandton / Rosebank" },
    { name: "Morningside", x: 64, y: 24, zone: "Sandton / Rosebank" },
    { name: "Wynberg", x: 57, y: 33, zone: "Sandton / Rosebank" },
    { name: "Parkhurst", x: 45, y: 36, zone: "Randburg / Roodepoort" },
    { name: "Randburg", x: 37, y: 32, zone: "Randburg / Roodepoort" },
    { name: "Roodepoort", x: 19, y: 44, zone: "Randburg / Roodepoort" },
    { name: "Soweto", x: 18, y: 69, zone: "Soweto" },
    { name: "Midrand", x: 70, y: 16, zone: "Midrand / Centurion" },
    { name: "Centurion", x: 78, y: 9, zone: "Midrand / Centurion" },
    { name: "Pretoria", x: 86, y: 4, zone: "Midrand / Centurion" },
];
const STREETS = {
    "Johannesburg CBD": ["Commissioner St", "Fox St", "Rissik St", "Eloff St", "Marshall St"],
    Braamfontein: ["Juta St", "De Korte St", "Jorissen St", "Smit St"],
    "Johannesburg South": ["Rifle Range Rd", "Xavier St", "Turf Club St", "Booysens Rd"],
    "City Deep": ["Heidelberg Rd", "Rosherville Rd", "Main Reef Rd"],
    Sandton: ["Rivonia Rd", "West St", "Maude St", "Katherine St", "Grayston Dr"],
    Rosebank: ["Oxford Rd", "Baker St", "Tyrwhitt Ave", "Bolton Rd"],
    Morningside: ["Rivonia Rd", "Outspan Rd", "Hume Rd"],
    Wynberg: ["Pretoria Rd", "1st Ave", "Andries St"],
    Parkhurst: ["4th Ave", "14th St", "Jan Smuts Ave"],
    Randburg: ["Republic Rd", "Bram Fischer Dr", "Hans Schoeman St"],
    Roodepoort: ["Ontdekkers Rd", "Hendrik Potgieter Rd", "Christiaan de Wet Rd"],
    Soweto: ["Vilakazi St", "Klipspruit Valley Rd", "Chris Hani Rd", "Old Potch Rd"],
    Midrand: ["New Rd", "Allandale Rd", "Le Roux Ave", "Sixteenth Rd"],
    Centurion: ["Lenchen Ave", "John Vorster Dr", "Jean Ave"],
    Pretoria: ["Church St", "Lynnwood Rd", "Duncan St"],
};
const FIRST = [
    "Thabo", "Lerato", "Sipho", "Nomsa", "Johan", "Ayanda", "Kabelo", "Fatima", "Riaan", "Zanele",
    "Bongani", "Precious", "Andile", "Karabo", "Sibusiso", "Anele", "Neo", "Tumi", "Pieter", "Naledi",
    "Mpho", "Reneilwe", "Shaun", "Palesa", "Musa", "Dineo", "Gift", "Zodwa", "Themba", "Yusuf",
];
const LAST = [
    "Mokoena", "Ndlovu", "Dlamini", "van der Merwe", "Khumalo", "Botha", "Molefe", "Zulu", "Naidoo",
    "Mashaba", "Patel", "Nkosi", "Mthembu", "Sithole", "Radebe", "Maluleke", "Pillay", "Smit",
    "Baloyi", "Mabaso",
];
export const SERVICES = [
    "Standard Local",
    "Extended Urban",
    "Same-Day Priority",
    "Scheduled Route",
    "Reverse Logistics",
];
export const SERVICE_PRICE = {
    "Standard Local": 30,
    "Extended Urban": 45,
    "Same-Day Priority": 75,
    "Scheduled Route": 38,
    "Reverse Logistics": 55,
};
export const INSPECTION_ITEMS = [
    { name: "Brakes", critical: true },
    { name: "Tyres", critical: true },
    { name: "Lights", critical: true },
    { name: "Indicators", critical: true },
    { name: "Horn", critical: false },
    { name: "Mirrors", critical: false },
    { name: "Windscreen", critical: false },
    { name: "Body", critical: false },
    { name: "Cargo compartment", critical: false },
    { name: "Doors", critical: false },
    { name: "Locks", critical: true },
    { name: "Safety equipment", critical: true },
    { name: "Fluid levels", critical: false },
];
export const TRAINING_COURSES = [
    "Defensive Driving",
    "Vehicle Handling",
    "Load Securing",
    "Wet Weather Driving",
    "Theft Awareness",
    "Emergency Procedures",
];
/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const iso = (date, hour, minute) => `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
const plate = (rand) => {
    const L = "BCDFGHJKLMNPRSTVWXYZ";
    const p = () => L[Math.floor(rand() * L.length)];
    return `${p()}${p()} ${randInt(rand, 10, 99)} ${p()}${p()} GP`;
};
/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */
const buildRoutes = () => [
    {
        id: "RT-001",
        name: "Johannesburg South",
        zone: "Johannesburg South",
        driverId: "DRV-001",
        vehicleId: "3W-001",
        stops: [],
        distanceKm: 46,
        status: "Active",
        startTime: "06:40",
        eta: "15:10",
        colour: "#12a05c",
        path: [
            { x: 56, y: 63 }, { x: 52, y: 58 }, { x: 48, y: 53 }, { x: 45, y: 48 },
            { x: 47, y: 60 }, { x: 50, y: 74 }, { x: 54, y: 70 }, { x: 56, y: 63 },
        ],
    },
    {
        id: "RT-002",
        name: "Sandton / Rosebank",
        zone: "Sandton / Rosebank",
        driverId: "DRV-002",
        vehicleId: "3W-003",
        stops: [],
        distanceKm: 58,
        status: "Active",
        startTime: "06:30",
        eta: "15:40",
        colour: "#2b5480",
        path: [
            { x: 56, y: 63 }, { x: 54, y: 50 }, { x: 52, y: 38 }, { x: 57, y: 33 },
            { x: 60, y: 30 }, { x: 64, y: 24 }, { x: 58, y: 40 }, { x: 56, y: 63 },
        ],
    },
    {
        id: "RT-003",
        name: "Soweto",
        zone: "Soweto",
        driverId: "DRV-003",
        vehicleId: "3W-004",
        stops: [],
        distanceKm: 62,
        status: "Active",
        startTime: "06:15",
        eta: "16:05",
        colour: "#d97706",
        path: [
            { x: 56, y: 63 }, { x: 44, y: 66 }, { x: 32, y: 68 }, { x: 18, y: 69 },
            { x: 22, y: 74 }, { x: 34, y: 72 }, { x: 48, y: 68 }, { x: 56, y: 63 },
        ],
    },
    {
        id: "RT-004",
        name: "Midrand / Centurion",
        zone: "Midrand / Centurion",
        driverId: "DRV-004",
        vehicleId: "3W-006",
        stops: [],
        distanceKm: 84,
        status: "Delayed",
        startTime: "06:00",
        eta: "16:45",
        colour: "#7c3aed",
        path: [
            { x: 56, y: 63 }, { x: 60, y: 44 }, { x: 64, y: 30 }, { x: 70, y: 16 },
            { x: 78, y: 9 }, { x: 74, y: 20 }, { x: 64, y: 40 }, { x: 56, y: 63 },
        ],
    },
    {
        id: "RT-005",
        name: "Randburg / Roodepoort",
        zone: "Randburg / Roodepoort",
        driverId: "DRV-005",
        vehicleId: "3W-007",
        stops: [],
        distanceKm: 71,
        status: "Active",
        startTime: "06:50",
        eta: "15:55",
        colour: "#0891b2",
        path: [
            { x: 56, y: 63 }, { x: 48, y: 50 }, { x: 45, y: 36 }, { x: 37, y: 32 },
            { x: 26, y: 38 }, { x: 19, y: 44 }, { x: 34, y: 52 }, { x: 56, y: 63 },
        ],
    },
];
const buildDrivers = (rand, today) => {
    const names = [
        "Thabo Mokoena", "Lerato Dlamini", "Sipho Ndlovu", "Nomsa Khumalo", "Johan van der Merwe",
        "Ayanda Zulu", "Kabelo Molefe", "Fatima Patel", "Riaan Naidoo", "Zanele Sithole",
        "Bongani Radebe", "Precious Mashaba", "Andile Mthembu", "Karabo Baloyi", "Sibusiso Nkosi",
    ];
    const zones = [
        "Johannesburg South", "Sandton / Rosebank", "Soweto", "Midrand / Centurion",
        "Randburg / Roodepoort",
    ];
    return names.map((name, i) => {
        const id = `DRV-${String(i + 1).padStart(3, "0")}`;
        const onRoute = i < 8;
        const training = TRAINING_COURSES.map((course, ci) => {
            const roll = rand();
            const status = roll > 0.88 ? "Expired" : roll > 0.74 ? "Pending" : "Completed";
            const date = addDays(today, -randInt(rand, 30, 420));
            return {
                course,
                status: (ci === 0 && i === 6 ? "Expired" : status),
                date,
                expires: addDays(date, 730),
            };
        });
        return {
            id,
            name,
            phone: `07${randInt(rand, 1, 9)} ${randInt(rand, 200, 999)} ${randInt(rand, 1000, 9999)}`,
            email: `${name.split(" ")[0].toLowerCase()}.${name.split(" ").slice(-1)[0].toLowerCase().replace(/\s/g, "")}@easydrop.co.za`,
            status: onRoute ? "On Route" : i < 11 ? "Available" : i < 14 ? "Off Duty" : "On Leave",
            vehicleId: onRoute ? `3W-${String(i + 1).padStart(3, "0")}` : null,
            routeId: i < 5 ? `RT-${String(i + 1).padStart(3, "0")}` : null,
            licence: `${randInt(rand, 10, 99)}${randInt(rand, 100000, 999999)}`,
            licenceClass: pick(rand, ["Code B", "Code B", "Code EB", "Code C1"]),
            licenceExpiry: addDays(today, randInt(rand, -20, 900)),
            zone: zones[i % zones.length],
            joined: addDays(today, -randInt(rand, 90, 1200)),
            deliveriesToday: onRoute ? randInt(rand, 28, 48) : randInt(rand, 0, 12),
            deliveriesTotal: randInt(rand, 480, 4200),
            onTimePct: randInt(rand, 86, 99),
            firstAttemptPct: randInt(rand, 84, 98),
            safetyScore: randInt(rand, 72, 99),
            incidents: rand() > 0.78 ? 1 : 0,
            nearMisses: randInt(rand, 0, 3),
            rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
            shiftStarted: onRoute ? iso(today, 6, randInt(rand, 0, 45)) : null,
            training,
        };
    });
};
const buildVehicles = (rand, today, routes) => {
    const models = [
        { model: "TVS King Deluxe Cargo", type: "3-Wheel Cargo", fuel: "Petrol", payload: 350 },
        { model: "Bajaj Maxima Cargo", type: "3-Wheel Cargo", fuel: "Petrol", payload: 320 },
        { model: "Piaggio Ape City Cargo", type: "3-Wheel Cargo", fuel: "Petrol", payload: 300 },
        { model: "3Wheel E-Cargo 400", type: "3-Wheel Electric Cargo", fuel: "Electric", payload: 400 },
    ];
    return Array.from({ length: 10 }, (_, i) => {
        const id = `3W-${String(i + 1).padStart(3, "0")}`;
        const m = models[i % models.length];
        const route = routes.find((r) => r.vehicleId === id) ?? null;
        const onRoute = ["3W-001", "3W-003", "3W-004", "3W-006", "3W-007", "3W-009", "3W-002", "3W-005"].includes(id);
        const status = id === "3W-008" ? "Maintenance" : onRoute ? "On Route" : "Available";
        const mileage = randInt(rand, 8_400, 62_000);
        const driver = onRoute ? `DRV-${String(i + 1).padStart(3, "0")}` : null;
        const zone = route?.zone ?? SUBURBS[(i * 3) % SUBURBS.length].zone;
        const startPos = route ? route.path[0] : { x: HUB.x, y: HUB.y };
        const jitter = () => (rand() - 0.5) * 8;
        return {
            id,
            registration: plate(rand),
            model: m.model,
            year: randInt(rand, 2021, 2025),
            type: m.type,
            payloadKg: m.payload,
            fuelType: m.fuel,
            mileageKm: mileage,
            driverId: driver,
            routeId: route?.id ?? null,
            zone,
            status,
            energyPct: randInt(rand, 28, 98),
            lastInspection: today,
            lastInspectionResult: "Pass",
            nextServiceKm: mileage + randInt(rand, -400, 2600),
            nextServiceDate: addDays(today, randInt(rand, -6, 55)),
            revenueMtd: randInt(rand, 38_000, 74_000),
            costsMtd: randInt(rand, 23_000, 42_000),
            deliveriesMtd: randInt(rand, 620, 1180),
            utilisationPct: randInt(rand, 62, 96),
            pos: onRoute ? { x: startPos.x + jitter(), y: startPos.y + jitter() } : { x: HUB.x + jitter(), y: HUB.y + jitter() },
            progress: onRoute ? rand() : 0,
            speed: onRoute ? randInt(rand, 18, 46) : 0,
            blockedReason: id === "3W-008" ? "Scheduled 10 000 km service in progress" : undefined,
        };
    });
};
const buildCustomers = () => [
    {
        id: "CUS-001", business: "ABC Retail", industry: "Retail", contactName: "Melissa Naidoo",
        phone: "011 483 2210", email: "logistics@abcretail.co.za",
        pickupLocations: ["ABC Retail DC, City Deep", "ABC Retail Sandton City"],
        contract: "12-month volume contract", slaTargetPct: 95, monthlyVolume: 2400,
        deliveriesMtd: 2187, revenueMtd: 96_228, onTimePct: 94, complaints: 4,
        billingTerms: "30 days from statement", accountNumber: "ACC-4410", since: "2023-07-01",
        logoTone: "#12a05c",
    },
    {
        id: "CUS-002", business: "Ubuntu Pharmacy Group", industry: "Pharmacy", contactName: "Dr Sandile Mbatha",
        phone: "011 726 8890", email: "dispatch@ubuntupharmacy.co.za",
        pickupLocations: ["Ubuntu Central Pharmacy, Braamfontein", "Ubuntu Rosebank"],
        contract: "Dedicated vehicle + driver", slaTargetPct: 97, monthlyVolume: 1650,
        deliveriesMtd: 1584, revenueMtd: 79_200, onTimePct: 96, complaints: 1,
        billingTerms: "14 days from invoice", accountNumber: "ACC-4411", since: "2023-02-14",
        logoTone: "#0891b2",
    },
    {
        id: "CUS-003", business: "Local Foods Market", industry: "Grocer", contactName: "Johan Pretorius",
        phone: "011 954 1120", email: "orders@localfoods.co.za",
        pickupLocations: ["Local Foods Market, Roodepoort"],
        contract: "Pay-as-you-go", slaTargetPct: 93, monthlyVolume: 980,
        deliveriesMtd: 902, revenueMtd: 33_374, onTimePct: 91, complaints: 6,
        billingTerms: "Prepaid wallet", accountNumber: "ACC-4412", since: "2024-03-05",
        logoTone: "#d97706",
    },
    {
        id: "CUS-004", business: "Metro Wholesale", industry: "Wholesale", contactName: "Yusuf Ebrahim",
        phone: "011 613 4477", email: "supplychain@metrowholesale.co.za",
        pickupLocations: ["Metro Wholesale, City Deep", "Metro Wholesale, Wynberg"],
        contract: "Scheduled dedicated routes", slaTargetPct: 95, monthlyVolume: 1420,
        deliveriesMtd: 1361, revenueMtd: 61_245, onTimePct: 93, complaints: 3,
        billingTerms: "30 days from statement", accountNumber: "ACC-4413", since: "2022-11-20",
        logoTone: "#7c3aed",
    },
    {
        id: "CUS-005", business: "QuickCart Online", industry: "E-commerce", contactName: "Chantal de Wet",
        phone: "010 224 9080", email: "fulfilment@quickcart.co.za",
        pickupLocations: ["QuickCart Fulfilment Centre, Midrand"],
        contract: "12-month volume contract", slaTargetPct: 96, monthlyVolume: 3100,
        deliveriesMtd: 2946, revenueMtd: 132_570, onTimePct: 92, complaints: 9,
        billingTerms: "30 days from statement", accountNumber: "ACC-4414", since: "2023-09-11",
        logoTone: "#2b5480",
    },
    {
        id: "CUS-006", business: "Kasi Hardware SME", industry: "SME / Hardware", contactName: "Bongani Sibeko",
        phone: "011 938 6612", email: "bongani@kasihardware.co.za",
        pickupLocations: ["Kasi Hardware, Soweto"],
        contract: "Pay-as-you-go", slaTargetPct: 90, monthlyVolume: 420,
        deliveriesMtd: 388, revenueMtd: 13_580, onTimePct: 89, complaints: 2,
        billingTerms: "Prepaid wallet", accountNumber: "ACC-4415", since: "2024-08-02",
        logoTone: "#0a663b",
    },
];
const statusPlan = [
    ["Delivered", 351],
    ["Failed", 5],
    ["Returned", 2],
    ["In Transit", 15],
    ["Picked Up", 5],
    ["Dispatched", 3],
    ["Assigned", 3],
    ["Pending", 2],
];
const buildDeliveries = (rand, today, customers, routes, drivers) => {
    const list = [];
    const statuses = [];
    statusPlan.forEach(([s, n]) => {
        for (let i = 0; i < n; i++)
            statuses.push(s);
    });
    // spread the non-delivered ones through the list for realism
    statuses.sort(() => rand() - 0.5);
    statuses.forEach((status, i) => {
        const seq = i + 1;
        const id = `DW-${10000 + seq}`;
        const customer = pick(rand, customers);
        const suburb = pick(rand, SUBURBS);
        const street = pick(rand, STREETS[suburb.name] ?? ["Main Rd"]);
        const route = routes.find((r) => r.zone === suburb.zone) ?? routes[0];
        // weighted service mix keeps the average revenue per delivery near R40
        const serviceRoll = rand();
        const service = serviceRoll < 0.45 ? "Standard Local"
            : serviceRoll < 0.65 ? "Extended Urban"
                : serviceRoll < 0.77 ? "Same-Day Priority"
                    : serviceRoll < 0.95 ? "Scheduled Route"
                        : "Reverse Logistics";
        const priority = rand() > 0.88 ? "Urgent" : rand() > 0.68 ? "High" : "Standard";
        const hour = [6, 7, 8, 9, 9, 10, 10, 11, 11, 12, 13, 13, 14, 14, 15, 15, 16, 17][Math.floor(rand() * 18)];
        const minute = randInt(rand, 0, 59);
        const createdAt = iso(today, Math.max(5, hour - 1), minute);
        const assigned = !["Pending"].includes(status);
        const driverId = assigned ? route.driverId : null;
        const vehicleId = assigned ? route.vehicleId : null;
        const delivered = status === "Delivered";
        const failed = status === "Failed" || status === "Returned";
        // deterministic so the demo always opens on ~91% on-time / ~92% first attempt
        const onTime = delivered ? seq % 11 !== 0 : null;
        const firstAttempt = delivered ? seq % 12 !== 0 : failed ? false : null;
        const driver = drivers.find((d) => d.id === driverId);
        const events = [
            { at: createdAt, label: "Created", detail: `Booked by ${customer.business}`, actor: "Operations" },
        ];
        if (assigned)
            events.push({
                at: iso(today, hour, Math.min(59, minute + 4)),
                label: "Assigned",
                detail: `${driver?.name ?? "Driver"} · ${vehicleId} · ${route.id}`,
                actor: "Dispatch",
            });
        if (["Dispatched", "Picked Up", "In Transit", "Delivered", "Failed", "Returned"].includes(status))
            events.push({ at: iso(today, hour, Math.min(59, minute + 9)), label: "Dispatched", detail: `Left ${HUB.name}`, actor: "Dispatch" });
        if (["Picked Up", "In Transit", "Delivered", "Failed", "Returned"].includes(status))
            events.push({ at: iso(today, hour, Math.min(59, minute + 22)), label: "Picked Up", detail: "Parcel collected", actor: driver?.name ?? "Driver" });
        if (["In Transit", "Delivered", "Failed", "Returned"].includes(status))
            events.push({ at: iso(today, hour + 1 > 23 ? 23 : hour + 1, minute), label: "In Transit", detail: `En route to ${suburb.name}`, actor: driver?.name ?? "Driver" });
        if (delivered)
            events.push({ at: iso(today, Math.min(23, hour + 1), Math.min(59, minute + 35)), label: "Delivered", detail: "Proof of delivery captured", actor: driver?.name ?? "Driver" });
        if (status === "Failed")
            events.push({ at: iso(today, Math.min(23, hour + 1), Math.min(59, minute + 30)), label: "Failed", detail: "Recipient not available", actor: driver?.name ?? "Driver" });
        if (status === "Returned")
            events.push({ at: iso(today, Math.min(23, hour + 2), minute), label: "Returned to hub", detail: "Parcel returned to City Deep Hub", actor: driver?.name ?? "Driver" });
        const recipientName = `${pick(rand, FIRST)} ${pick(rand, LAST)}`;
        const hubStage = delivered
            ? "Delivered"
            : status === "Pending"
                ? "Received"
                : status === "Assigned"
                    ? "Assigned"
                    : status === "Dispatched" || status === "Picked Up" || status === "In Transit"
                        ? "Dispatched"
                        : status === "Returned"
                            ? "Received"
                            : "Loaded";
        list.push({
            id,
            customerId: customer.id,
            recipient: recipientName,
            phone: `07${randInt(rand, 1, 9)} ${randInt(rand, 200, 999)} ${randInt(rand, 1000, 9999)}`,
            pickup: customer.pickupLocations[0],
            destination: `${randInt(rand, 1, 240)} ${street}`,
            suburb: suburb.name,
            parcels: randInt(rand, 1, 4),
            weightKg: Math.round((0.4 + rand() * 18) * 10) / 10,
            service,
            priority,
            status,
            hubStage: hubStage,
            driverId,
            vehicleId,
            routeId: assigned ? route.id : null,
            createdAt,
            window: pick(rand, ["08:00 – 12:00", "09:00 – 13:00", "12:00 – 16:00", "14:00 – 18:00"]),
            eta: iso(today, Math.min(23, hour + 1), minute),
            instructions: pick(rand, [
                "Ring the buzzer at the gate.",
                "Leave with reception if unavailable.",
                "Complex — sign in at security.",
                "Call recipient on arrival.",
                "Deliver to loading bay entrance.",
                "",
            ]),
            notes: "",
            price: SERVICE_PRICE[service] + randInt(rand, 0, 1) * 5,
            attempts: failed ? 1 : delivered ? (firstAttempt ? 1 : 2) : 0,
            onTime,
            firstAttempt,
            failureReason: status === "Failed" ? pick(rand, ["Recipient not available", "Incorrect address", "Access denied at complex", "Recipient refused parcel"]) : undefined,
            pod: delivered
                ? {
                    recipient: recipientName,
                    signature: "M5,40 C20,10 35,55 50,25 C65,5 80,45 95,20",
                    photo: "Parcel handed to recipient at door",
                    notes: "",
                    capturedAt: iso(today, Math.min(23, hour + 1), Math.min(59, minute + 35)),
                    location: `${suburb.name}, Gauteng`,
                    driverId: driverId ?? "DRV-001",
                    vehicleId: vehicleId ?? "3W-001",
                }
                : undefined,
            events,
            createdBy: rand() > 0.55 ? "Customer Portal" : "Operations",
        });
    });
    // sort newest first
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return list;
};
const buildHistory = (rand, today) => Array.from({ length: 30 }, (_, i) => {
    // history covers the 30 completed days up to and including yesterday
    const date = addDays(today, -(30 - i));
    const dow = new Date(date + "T00:00:00").getDay();
    const weekend = dow === 0 ? 0.42 : dow === 6 ? 0.72 : 1;
    const deliveries = Math.round((330 + rand() * 90) * weekend);
    const failed = Math.round(deliveries * (0.012 + rand() * 0.02));
    const completed = deliveries - failed - Math.round(rand() * 6);
    return {
        date,
        deliveries,
        completed,
        failed,
        onTimePct: Math.round((89 + rand() * 8) * 10) / 10,
        firstAttemptPct: Math.round((88 + rand() * 9) * 10) / 10,
        revenue: Math.round(deliveries * (38 + rand() * 6)),
        costs: Math.round(deliveries * (23 + rand() * 4)),
        utilisationPct: Math.round((72 + rand() * 22) * 10) / 10,
        distanceKm: Math.round(deliveries * (1.1 + rand() * 0.5)),
        complaints: Math.round(rand() * 4),
        incidents: rand() > 0.8 ? 1 : 0,
    };
});
const buildMaintenance = (rand, today) => {
    const services = [
        "10 000 km minor service", "20 000 km major service", "Brake pad replacement",
        "Tyre replacement (rear pair)", "Clutch cable replacement", "Battery health check",
        "Chain & sprocket service", "Suspension inspection", "Cargo box repair", "Headlight replacement",
    ];
    const techs = ["Willem Grobler", "Sipho Mahlangu", "Ravi Chetty", "Dumisani Khoza"];
    return services.map((service, i) => {
        const status = i === 0 ? "In Progress" : i < 3 ? "Due" : i === 3 ? "Overdue" : i < 6 ? "Scheduled" : "Completed";
        return {
            id: `MNT-${2000 + i}`,
            vehicleId: `3W-${String(((i * 3) % 10) + 1).padStart(3, "0")}`,
            service,
            mileage: randInt(rand, 8000, 60000),
            date: addDays(today, status === "Completed" ? -randInt(rand, 3, 40) : randInt(rand, -4, 21)),
            technician: pick(rand, techs),
            cost: randInt(rand, 380, 4800),
            status,
            notes: status === "In Progress" ? "Vehicle at Booysens workshop." : "",
        };
    });
};
const buildFuel = (rand, today, vehicles) => {
    const out = [];
    for (let d = 0; d < 14; d++) {
        vehicles.slice(0, 8).forEach((v, i) => {
            if (rand() > 0.72)
                return;
            const distance = randInt(rand, 42, 120);
            const electric = v.fuelType === "Electric";
            const units = electric
                ? Math.round(distance * (0.07 + rand() * 0.03) * 10) / 10
                : Math.round(distance * (0.033 + rand() * 0.012) * 10) / 10;
            out.push({
                id: `FUE-${d}${i}${Math.floor(rand() * 900 + 100)}`,
                vehicleId: v.id,
                date: addDays(today, -d),
                fuelType: v.fuelType,
                units,
                cost: Math.round(units * (electric ? 3.4 : 23.1)),
                distanceKm: distance,
            });
        });
    }
    return out;
};
const buildParts = () => [
    { id: "PRT-001", sku: "3W-BRK-PAD-01", name: "Brake pad set (front)", category: "Braking", qty: 24, minStock: 10, unitCost: 285, supplier: "Gauteng Moto Spares" },
    { id: "PRT-002", sku: "3W-TYR-400-8", name: "Tyre 4.00-8 cargo", category: "Tyres", qty: 6, minStock: 8, unitCost: 640, supplier: "Tyre Depot JHB" },
    { id: "PRT-003", sku: "3W-OIL-10W40", name: "Engine oil 10W-40 (1 ℓ)", category: "Fluids", qty: 48, minStock: 20, unitCost: 118, supplier: "Midrand Lubricants" },
    { id: "PRT-004", sku: "3W-BAT-12V", name: "12V battery", category: "Electrical", qty: 0, minStock: 4, unitCost: 1250, supplier: "PowerCell SA" },
    { id: "PRT-005", sku: "3W-CHN-KIT", name: "Chain & sprocket kit", category: "Drivetrain", qty: 11, minStock: 5, unitCost: 890, supplier: "Gauteng Moto Spares" },
    { id: "PRT-006", sku: "3W-LGT-HEAD", name: "Headlight assembly", category: "Electrical", qty: 7, minStock: 4, unitCost: 460, supplier: "AutoLite Randburg" },
    { id: "PRT-007", sku: "3W-CGO-LOCK", name: "Cargo box lock set", category: "Security", qty: 3, minStock: 6, unitCost: 320, supplier: "SecureBox Suppliers" },
    { id: "PRT-008", sku: "3W-AIR-FLT", name: "Air filter", category: "Engine", qty: 19, minStock: 10, unitCost: 165, supplier: "Midrand Lubricants" },
    { id: "PRT-009", sku: "3W-MIR-SET", name: "Mirror set", category: "Body", qty: 14, minStock: 6, unitCost: 210, supplier: "AutoLite Randburg" },
    { id: "PRT-010", sku: "3W-EXT-1KG", name: "Fire extinguisher 1 kg", category: "Safety", qty: 5, minStock: 10, unitCost: 395, supplier: "SafetyFirst Gauteng" },
    { id: "PRT-011", sku: "3W-STR-BELT", name: "Load securing strap", category: "Safety", qty: 42, minStock: 20, unitCost: 95, supplier: "SecureBox Suppliers" },
    { id: "PRT-012", sku: "3W-EV-CHRG", name: "EV charge cable (Type 2)", category: "Electrical", qty: 4, minStock: 3, unitCost: 2150, supplier: "PowerCell SA" },
];
const buildIncidents = (today) => [
    {
        id: "INC-0041", type: "Minor collision", date: today, time: "09:14", location: "Rivonia Rd, Sandton",
        driverId: "DRV-002", vehicleId: "3W-003", deliveryId: null, severity: "Medium",
        description: "Vehicle clipped a stationary bakkie while exiting a tight loading bay. Cargo box scuffed, no injuries.",
        correctiveAction: "Driver re-briefed on loading bay manoeuvring. Body repair quote requested.",
        status: "Under Review", preventable: true,
    },
    {
        id: "INC-0040", type: "Parcel damage", date: today, time: "11:42", location: "Klipspruit Valley Rd, Soweto",
        driverId: "DRV-003", vehicleId: "3W-004", deliveryId: null, severity: "Low",
        description: "Unsecured parcel shifted in the cargo compartment and was damaged in transit.",
        correctiveAction: "Load securing refresher scheduled. Customer credited.",
        status: "Open", preventable: true,
    },
    {
        id: "INC-0039", type: "Attempted theft", date: addDays(today, -4), time: "17:05", location: "Johannesburg CBD",
        driverId: "DRV-001", vehicleId: "3W-001", deliveryId: null, severity: "High",
        description: "Driver approached by two individuals at a traffic light. Driver followed theft awareness protocol and left the area safely.",
        correctiveAction: "Route adjusted to avoid the intersection after 16:00. Incident logged with security partner.",
        status: "Closed", preventable: false,
    },
    {
        id: "INC-0038", type: "Tyre blowout", date: addDays(today, -9), time: "13:20", location: "Ontdekkers Rd, Roodepoort",
        driverId: "DRV-005", vehicleId: "3W-007", deliveryId: null, severity: "Medium",
        description: "Rear tyre blowout at low speed. Vehicle brought to a controlled stop, deliveries transferred.",
        correctiveAction: "Tyre replaced; tyre age inspection added to weekly checks.",
        status: "Closed", preventable: true,
    },
];
const buildNearMisses = (today) => [
    { id: "NM-0112", driverId: "DRV-004", vehicleId: "3W-006", location: "Allandale Rd, Midrand", date: today, time: "08:22", riskType: "Cut-off by taxi", description: "Minibus taxi cut across the lane at a rank. Driver braked early and avoided contact.", action: "Zone flagged; drivers briefed on taxi rank approach speeds." },
    { id: "NM-0111", driverId: "DRV-001", vehicleId: "3W-001", location: "Main Reef Rd, City Deep", date: today, time: "07:05", riskType: "Poor road surface", description: "Large pothole in the left lane near the hub exit.", action: "Hub exit route adjusted; municipality reference logged." },
    { id: "NM-0110", driverId: "DRV-007", vehicleId: "3W-009", location: "Oxford Rd, Rosebank", date: addDays(today, -1), time: "15:48", riskType: "Pedestrian", description: "Pedestrian stepped into the road between parked cars.", action: "Speed advisory for Rosebank retail strip." },
    { id: "NM-0109", driverId: "DRV-003", vehicleId: "3W-004", location: "Chris Hani Rd, Soweto", date: addDays(today, -2), time: "12:10", riskType: "Wet weather", description: "Reduced traction on a painted surface during rain.", action: "Wet weather driving module reassigned." },
    { id: "NM-0108", driverId: "DRV-006", vehicleId: "3W-002", location: "Republic Rd, Randburg", date: addDays(today, -3), time: "10:30", riskType: "Load shift", description: "Load shifted on a sharp turn; no damage.", action: "Load securing check added to pre-departure." },
    { id: "NM-0107", driverId: "DRV-008", vehicleId: "3W-005", location: "Rifle Range Rd, Johannesburg South", date: addDays(today, -5), time: "16:02", riskType: "Visibility", description: "Sun glare at intersection reduced visibility.", action: "Visors issued to all drivers on west-facing afternoon routes." },
];
const buildTelematics = (rand, today) => {
    const types = ["Harsh Braking", "Harsh Acceleration", "Speeding", "Idling", "Sharp Cornering"];
    return Array.from({ length: 16 }, (_, i) => ({
        id: `TEL-${5000 + i}`,
        vehicleId: `3W-${String(randInt(rand, 1, 9)).padStart(3, "0")}`,
        type: pick(rand, types),
        time: iso(today, randInt(rand, 6, 16), randInt(rand, 0, 59)),
        value: pick(rand, ["-0.42 g", "-0.38 g", "68 km/h in 60 zone", "11 min stationary", "0.35 g lateral", "72 km/h in 60 zone"]),
        location: pick(rand, SUBURBS).name,
    }));
};
const buildDocuments = (rand, today, vehicles, drivers) => {
    const docs = [];
    const statusFor = (expires) => {
        const days = Math.round((new Date(expires).getTime() - new Date(today).getTime()) / 86400000);
        return days < 0 ? "Expired" : days < 45 ? "Expiring Soon" : "Valid";
    };
    vehicles.forEach((v, i) => {
        [
            ["Vehicle registration (simulated)", "Registration"],
            ["Roadworthy record (simulated)", "Roadworthiness"],
            ["Fleet insurance cover note (simulated)", "Insurance"],
        ].forEach(([name, type], j) => {
            const expires = addDays(today, randInt(rand, i === 3 && j === 1 ? -25 : 10, 400));
            docs.push({
                id: `DOC-${v.id}-${j}`, entityType: "Vehicle", entityId: v.id, entityName: v.id,
                name, docType: type, issued: addDays(expires, -365), expires, status: statusFor(expires),
            });
        });
    });
    drivers.forEach((d, i) => {
        docs.push({
            id: `DOC-${d.id}-L`, entityType: "Driver", entityId: d.id, entityName: d.name,
            name: "Driving licence (simulated)", docType: "Licence",
            issued: addDays(d.licenceExpiry, -1825), expires: d.licenceExpiry, status: statusFor(d.licenceExpiry),
        });
        if (i % 3 === 0) {
            const expires = addDays(today, randInt(rand, -15, 300));
            docs.push({
                id: `DOC-${d.id}-T`, entityType: "Driver", entityId: d.id, entityName: d.name,
                name: "Defensive driving training record", docType: "Training",
                issued: addDays(expires, -730), expires, status: statusFor(expires),
            });
        }
    });
    docs.push({
        id: "DOC-CO-1", entityType: "Company", entityId: "EASY DROP", entityName: "Easy Drop Logistics",
        name: "Depot lease agreement (simulated)", docType: "Contract",
        issued: addDays(today, -400), expires: addDays(today, 330), status: "Valid",
    });
    return docs;
};
const buildInspections = (rand, today, vehicles) => vehicles.slice(0, 9).map((v, i) => ({
    id: `INS-${3000 + i}`,
    vehicleId: v.id,
    driverId: v.driverId ?? `DRV-${String(i + 1).padStart(3, "0")}`,
    date: today,
    time: `0${randInt(rand, 5, 6)}:${String(randInt(rand, 10, 59)).padStart(2, "0")}`,
    result: "Pass",
    criticalFail: false,
    odometer: v.mileageKm,
    items: INSPECTION_ITEMS.map((it) => ({ name: it.name, critical: it.critical, result: "Pass", notes: "" })),
}));
const buildUsers = () => [
    { id: "USR-001", name: "John Mahlangu", email: "john@easydrop.co.za", role: "ADMIN", status: "Active", lastActive: "today 07:10" },
    { id: "USR-002", name: "Ruth Petersen", email: "ruth@easydrop.co.za", role: "OPERATIONS", status: "Active", lastActive: "today 06:48" },
    { id: "USR-003", name: "Sizwe Dube", email: "sizwe@easydrop.co.za", role: "DISPATCHER", status: "Active", lastActive: "today 06:05" },
    { id: "USR-004", name: "Thabo Mokoena", email: "thabo.mokoena@easydrop.co.za", role: "DRIVER", status: "Active", lastActive: "today 06:12", linkedId: "DRV-001" },
    { id: "USR-005", name: "Melissa Naidoo", email: "logistics@abcretail.co.za", role: "BUSINESS CUSTOMER", status: "Active", lastActive: "today 08:31", linkedId: "CUS-001" },
    { id: "USR-006", name: "Chantal de Wet", email: "fulfilment@quickcart.co.za", role: "BUSINESS CUSTOMER", status: "Active", lastActive: "yesterday 17:20", linkedId: "CUS-005" },
    { id: "USR-007", name: "Lerato Dlamini", email: "lerato.dlamini@easydrop.co.za", role: "DRIVER", status: "Active", lastActive: "today 06:30", linkedId: "DRV-002" },
    { id: "USR-008", name: "Pieter Grobler", email: "pieter@easydrop.co.za", role: "OPERATIONS", status: "Suspended", lastActive: "12 days ago" },
];
const buildNotifications = (today) => [
    { id: "NTF-001", kind: "safety", tone: "critical", title: "Safety incident logged", message: "INC-0041 minor collision · 3W-003 · Rivonia Rd, Sandton", at: iso(today, 9, 18), read: false, link: "/ops/incidents?id=INC-0041" },
    { id: "NTF-002", kind: "maintenance", tone: "warning", title: "Maintenance due", message: "3W-008 is in the workshop for a 10 000 km service.", at: iso(today, 7, 5), read: false, link: "/ops/maintenance" },
    { id: "NTF-003", kind: "delivery", tone: "warning", title: "Delivery failed", message: "A delivery in Soweto failed — recipient not available.", at: iso(today, 11, 51), read: false, link: "/ops/deliveries?status=Failed" },
    { id: "NTF-004", kind: "route", tone: "warning", title: "Route running late", message: "RT-004 Midrand / Centurion is 38 minutes behind schedule.", at: iso(today, 12, 12), read: false, link: "/ops/routes?id=RT-004" },
    { id: "NTF-005", kind: "compliance", tone: "warning", title: "Compliance expiry", message: "A vehicle roadworthy record has expired. Review documents.", at: iso(today, 6, 40), read: true, link: "/ops/documents" },
    { id: "NTF-006", kind: "customer", tone: "info", title: "Customer complaint", message: "QuickCart Online logged a complaint about a late delivery.", at: iso(today, 10, 5), read: true, link: "/ops/customers?id=CUS-005" },
    { id: "NTF-007", kind: "inspection", tone: "success", title: "Inspections complete", message: "9 of 10 vehicles passed their pre-shift inspection.", at: iso(today, 6, 20), read: true, link: "/ops/inspections" },
];
const buildActivities = (today) => [
    { id: "ACT-001", kind: "delivery", title: "POD captured", detail: "Delivery completed in Sandton · signature captured", at: iso(today, 12, 42), link: "/ops/deliveries" },
    { id: "ACT-002", kind: "route", title: "Route completed", detail: "RT-002 Sandton / Rosebank finished its morning block", at: iso(today, 12, 15), link: "/ops/routes?id=RT-002" },
    { id: "ACT-003", kind: "safety", title: "Near miss reported", detail: "NM-0112 · taxi cut-off on Allandale Rd, Midrand", at: iso(today, 8, 24), link: "/ops/near-misses" },
    { id: "ACT-004", kind: "vehicle", title: "Vehicle dispatched", detail: "3W-007 left City Deep Hub on RT-005", at: iso(today, 6, 52), link: "/ops/vehicles?id=3W-007" },
    { id: "ACT-005", kind: "driver", title: "Driver assigned", detail: "Nomsa Khumalo assigned to RT-004", at: iso(today, 6, 2), link: "/ops/drivers?id=DRV-004" },
    { id: "ACT-006", kind: "maintenance", title: "Maintenance completed", detail: "3W-010 brake pad replacement signed off", at: iso(today, 7, 35), link: "/ops/maintenance" },
    { id: "ACT-007", kind: "customer", title: "Customer created delivery", detail: "QuickCart Online booked a Same-Day Priority delivery", at: iso(today, 9, 47), link: "/ops/deliveries" },
    { id: "ACT-008", kind: "inspection", title: "Inspection passed", detail: "3W-001 pre-shift inspection passed (13 checks)", at: iso(today, 5, 58), link: "/ops/inspections" },
];
/* ------------------------------------------------------------------ */
/* Seed factory                                                        */
/* ------------------------------------------------------------------ */
export const SEED_VERSION = 4;
export function createSeedState() {
    const rand = mulberry32(20260214);
    const today = todayISO();
    const routes = buildRoutes();
    const drivers = buildDrivers(rand, today);
    const vehicles = buildVehicles(rand, today, routes);
    const customers = buildCustomers();
    const deliveries = buildDeliveries(rand, today, customers, routes, drivers);
    // attach stops to routes (in-progress work first)
    routes.forEach((r) => {
        r.stops = deliveries
            .filter((d) => d.routeId === r.id)
            .slice(0, 34)
            .map((d) => d.id);
    });
    return {
        seedVersion: SEED_VERSION,
        today,
        users: buildUsers(),
        drivers,
        vehicles,
        customers,
        deliveries,
        routes,
        inspections: buildInspections(rand, today, vehicles),
        maintenance: buildMaintenance(rand, today),
        fuel: buildFuel(rand, today, vehicles),
        parts: buildParts(),
        incidents: buildIncidents(today),
        nearMisses: buildNearMisses(today),
        telematics: buildTelematics(rand, today),
        notifications: buildNotifications(today),
        activities: buildActivities(today),
        documents: buildDocuments(rand, today, vehicles, drivers),
        history: buildHistory(rand, today),
        breakEven: {
            vehicles: 10,
            operatingDays: 26,
            deliveriesPerVehicleDay: 42,
            revenuePerDelivery: 40,
            driverCostPerVehicle: 9800,
            fuelPerVehicle: 3400,
            maintenancePerVehicle: 1900,
            insurancePerVehicle: 1250,
            financePerVehicle: 3100,
            depotCosts: 48000,
            otherCosts: 26000,
        },
        settings: {
            companyName: "Easy Drop Logistics (Pty) Ltd",
            registration: "2023/114872/07 (simulated)",
            depot: "City Deep Hub, Johannesburg",
            operatingHours: "06:00 – 18:00",
            currency: "ZAR (R)",
            distanceUnit: "Kilometres (km)",
            autoAssign: true,
            requireInspection: true,
            podPhotoRequired: true,
            notifyDeliveryCreated: true,
            notifySafety: true,
            notifyMaintenance: true,
            density: "Comfortable",
        },
        session: {
            role: "ADMIN",
            userName: "John",
            driverId: "DRV-001",
            customerId: "CUS-001",
        },
        simulating: false,
    };
}
