package com.example.Rural.management.config;

import com.example.Rural.management.model.*;
import com.example.Rural.management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final FarmerRepository farmerRepository;
    private final CropRepository cropRepository;
    private final SchemeRepository schemeRepository;
    private final ShgRepository shgRepository;
    private final WeatherInfoRepository weatherInfoRepository;

    public DataSeeder(FarmerRepository farmerRepository,
                      CropRepository cropRepository,
                      SchemeRepository schemeRepository,
                      ShgRepository shgRepository,
                      WeatherInfoRepository weatherInfoRepository) {
        this.farmerRepository = farmerRepository;
        this.cropRepository = cropRepository;
        this.schemeRepository = schemeRepository;
        this.shgRepository = shgRepository;
        this.weatherInfoRepository = weatherInfoRepository;
    }

    @Override
    public void run(String... args) {
        seedFarmers();
        seedCrops();
        seedSchemes();
        seedShgs();
        seedWeather();
    }

    private void seedFarmers() {
        if (farmerRepository.count() == 0) {
            farmerRepository.saveAll(Arrays.asList(
                new Farmer("Suresh Yadav", 4.5, "Wheat", "Ward 2", "Active",
                    "+91 98765 11001", "Alluvial Clay", "Tube Well", 95.0,
                    "XXXX-XXXX-4512", "North Rampur", "PM-KISAN, Soil Health Card"),
                new Farmer("Kamla Bai", 2.0, "Onion", "Ward 1", "Active",
                    "+91 98765 11002", "Sandy Loam", "Canal & Drip", 52.0,
                    "XXXX-XXXX-8921", "East Rampur", "PM-KISAN, PM Fasal Bima"),
                new Farmer("Raju Singh", 6.0, "Sugarcane", "Ward 4", "Insured",
                    "+91 98765 11003", "Black Cotton Soil", "Canal", 240.0,
                    "XXXX-XXXX-3345", "South Rampur", "PM Fasal Bima, KCC"),
                new Farmer("Geeta Devi", 1.5, "Rice", "Ward 3", "Active",
                    "+91 98765 11004", "Clay Loam", "Tube Well", 38.0,
                    "XXXX-XXXX-7108", "West Rampur", "PM-KISAN"),
                new Farmer("Ramesh Patel", 5.0, "Mustard & Wheat", "Ward 2", "Active",
                    "+91 98765 11005", "Loamy Soil", "Sprinkler", 88.0,
                    "XXXX-XXXX-9023", "Central Rampur", "KCC, Mechanization Mission"),
                new Farmer("Anita Choudhary", 3.2, "Cotton", "Ward 3", "Active",
                    "+91 98765 11006", "Black Soil", "Drip Irrigation", 64.0,
                    "XXXX-XXXX-1194", "South Rampur", "PM-KISAN, PMKSY")
            ));
        }
    }

    private void seedCrops() {
        if (cropRepository.count() == 0) {
            cropRepository.saveAll(Arrays.asList(
                new Crop("Wheat", "Rabi", 125.0, 22.0, 2275.0,
                    "Medium (4-5 irrigations)", "N:P:K 120:60:40 kg/ha + Zinc",
                    "Monitor for Yellow Rust and Aphids during heading stage. Apply systemic fungicides if detected.",
                    "High-yielding varieties HD-2967 and DBW-187 adopted widely across Rampur. Sown November to December.", "March–April"),
                new Crop("Onion", "Rabi/Kharif", 54.0, 110.0, 1850.0,
                    "Frequent light irrigation", "N:P:K 100:50:50 + Sulphur 30 kg/ha",
                    "Thrips and Purple Blotch warning. Spray Neem oil or recommended insecticide at 15-day intervals.",
                    "Nashik Red and Bhima Super varieties prominent in Ward 1 clusters with drip irrigation.", "April–May"),
                new Crop("Mustard", "Rabi", 41.0, 18.0, 5650.0,
                    "Low (2 irrigations)", "N:P:K 80:40:20 + Gypsum 250 kg/ha",
                    "Surveillance for Mustard Aphid at flowering. Timely sowing in October minimizes aphid damage.",
                    "Pusa Mustard and Giriraj varieties favored for superior oil percentage above 40%.", "February–March"),
                new Crop("Rice", "Kharif", 98.0, 28.0, 2183.0,
                    "High (continuous shallow flooding)", "N:P:K 120:60:40 + Zinc Sulphate",
                    "Scout for Stem Borer and Bacterial Leaf Blight. Maintain clean bunds and optimal spacing.",
                    "Swarna Sub-1 and aromatic hybrid paddy grown in low-lying fertile tracts of Ward 3.", "October–November"),
                new Crop("Sugarcane", "Annual", 88.0, 380.0, 315.0,
                    "High (regular furrow irrigation)", "N:P:K 250:100:100 kg/ha with organic press-mud",
                    "Prevent Early Shoot Borer with trash mulching. Inspect for Red Rot resistant seed canes.",
                    "Co-0238 and Co-86032 varieties linked to nearby sugar mill cooperative for direct procurement.", "December–February"),
                new Crop("Cotton", "Kharif", 72.0, 14.0, 6620.0,
                    "Medium (drip or furrow)", "N:P:K 100:50:50 + Boron & Magnesium",
                    "Pheromone trap installation mandatory for Pink Bollworm tracking. Follow refuge crop guidelines.",
                    "Bt Cotton hybrid cultivation in well-drained black soils of Ward 3 and Ward 4.", "November–January")
            ));
        }
    }

    private void seedSchemes() {
        if (schemeRepository.count() == 0) {
            schemeRepository.saveAll(Arrays.asList(
                new Scheme("PM-KISAN Samman Nidhi", "Financial Support", "Ministry of Agriculture & Farmers Welfare",
                    "100% Central funding, Direct Benefit Transfer", "₹6,000 per year in 3 installments of ₹2,000",
                    "All landholding farmer families with cultivable landholding in their names.",
                    "Aadhaar card, Land ownership title (Khatauni), Bank passbook linked with NPCI/Aadhaar.",
                    "https://pmkisan.gov.in", "Active",
                    "Flagship direct income support enabling farmers to procure seeds, fertilizers and input supplies timely."),
                new Scheme("Pradhan Mantri Fasal Bima Yojana (PMFBY)", "Crop Insurance", "Ministry of Agriculture & Farmers Welfare",
                    "Premium capped at 2% for Kharif, 1.5% for Rabi, rest subsidized by Govt", "Full sum insured value per hectare",
                    "All farmers cultivating notified crops in Rampur panchayat (both loanee and non-loanee).",
                    "Land possession certificate, Sowing declaration certificate, Bank A/C details, Aadhaar.",
                    "https://pmfby.gov.in", "Active",
                    "Comprehensive insurance cover against yield losses from drought, flood, pests, and post-harvest losses."),
                new Scheme("Soil Health Card Scheme", "Agriculture & Soil Care", "Ministry of Agriculture & Farmers Welfare",
                    "100% Free soil test and nutrition prescription", "Customized macro/micro-nutrient advisory card",
                    "Every farmer resident with farming land in Rampur village.",
                    "Survey/Khasra number, Farmer ID, Aadhaar number.",
                    "https://soilhealth.dac.gov.in", "Active",
                    "Provides 12 parameters soil status to promote judicious balanced chemical and organic fertilizer usage."),
                new Scheme("Kisan Credit Card (KCC)", "Credit & Banking", "NABARD & Ministry of Finance",
                    "Concessional interest rate at 4% with prompt repayment incentive", "Up to ₹3,00,000 collateral-free limit",
                    "Individual/joint farmers, tenant farmers, oral lessees, and SHG members.",
                    "Identity proof, Address proof, Land cultivation records, Passport photos.",
                    "https://www.nabard.org", "Active",
                    "Hassle-free single window institutional credit for agricultural operations and domestic contingencies."),
                new Scheme("PM Krishi Sinchayee Yojana (Micro Irrigation)", "Irrigation", "Ministry of Jal Shakti",
                    "55% subsidy for small/marginal farmers, 45% for other farmers", "Up to ₹45,000 per acre for drip/sprinkler sets",
                    "Farmers having assured irrigation source like tube well, well, or farm pond.",
                    "Land revenue records, Water source electricity bill or certificate, Aadhaar.",
                    "https://pmksy.gov.in", "Active",
                    "Promotes 'Per Drop More Crop' precision water delivery saving up to 50% water while boosting yield.")
            ));
        }
    }

    private void seedShgs() {
        if (shgRepository.count() == 0) {
            shgRepository.saveAll(Arrays.asList(
                new ShgGroup("sakhi", "Sakhi SHG – Ward 1", "Ward 1", 12, "Active",
                    "School Uniform Tailoring & Organic Pickles Production", "₹4,20,000",
                    "Sunita Sharma", "Anita Verma", "State Bank of India (Rampur)", "SBIN0004821-XXXX",
                    "1st & 3rd Sunday at 3:00 PM", "March 2021", "₹1,50,000 NRLM Bank Loan (60% repaid on time)",
                    "Sakhi SHG is an exemplary women collective in Ward 1. They operate a centralized garment stitching unit supplying high quality uniforms for 4 village schools and bottle certified organic mango and lemon pickles sold at block mandis.",
                    "Sunita Sharma (President), Anita Verma (Treasurer), Rekha Devi, Savitri Bai, Poonam Yadav, Manju Rathore, Kamlesh Devi, Sarojini Patel, Sushila Bai, Radha Bai, Preeti Verma, Usha Devi"),
                new ShgGroup("pragati", "Pragati SHG – Ward 2", "Ward 2", 15, "Active",
                    "Village Dairy Collection & Vermicompost Bio-fertilizer Unit", "₹3,85,000",
                    "Sharda Bai", "Manju Devi", "Bank of Baroda (Rampur)", "BARB0RAMPUR-XXXX",
                    "Every Tuesday at 4:00 PM", "January 2022", "₹2,00,000 Dairy Development loan active",
                    "Pragati SHG operates the community milk collection center testing 450 liters daily in partnership with the district dairy federation. They also run 8 vermicompost beds producing organic manure for local farmers.",
                    "Sharda Bai (President), Manju Devi (Treasurer), Lakshmi Yadav, Kiran Meena, Maya Devi, Tara Bai, Deepa Soni, Suman Gurjar, Santosh Bai, Geeta Yadav, Pinky Sharma, Hemlata Bai, Lalita Meena, Nirmala Devi, Vimla Bai"),
                new ShgGroup("ujjwala", "Ujjwala SHG – Ward 3", "Ward 3", 11, "Active",
                    "Eco-friendly Jute Bags, File Folders & Hand Embroidery", "₹2,90,000",
                    "Kanti Devi", "Rukmini Bai", "Rampur Grameen Bank", "RGB000918-XXXX",
                    "Alternate Friday at 2:00 PM", "September 2023", "₹1,00,000 Micro-enterprise credit availed",
                    "Ujjwala SHG champions plastic alternatives by fabricating heavy-duty jute bags, official cloth file covers for panchayat offices, and artisanal Kantha stitch sarees displayed at district Saras fairs.",
                    "Kanti Devi (President), Rukmini Bai (Treasurer), Shakuntala Devi, Bharti Rao, Gayatri Bai, Pushpa Yadav, Kamla Choudhary, Meena Bai, Kaushalya Devi, Ritu Sharma, Asha Verma"),
                new ShgGroup("narishakti", "Nari Shakti – Ward 4", "Ward 4", 10, "New",
                    "Spices Grinding, Turmeric Processing & Multigrain Flour", "₹95,000",
                    "Pooja Sen", "Chandrakala Bai", "Rampur Grameen Bank", "RGB000924-XXXX",
                    "2nd & 4th Saturday at 5:00 PM", "July 2026", "Revolving Fund (RF) ₹15,000 received",
                    "Newly formed women entrepreneurship group in Ward 4. The group has completed FSSAI hygiene training and set up cold-pressed spice grinding units supplying pure turmeric, coriander, and stone-ground multigrain flour.",
                    "Pooja Sen (President), Chandrakala Bai (Treasurer), Varsha Meena, Archana Yadav, Mamta Rathore, Jyoti Sen, Bhagwati Bai, Sarita Devi, Krishna Bai, Seema Choudhary")
            ));
        }
    }

    private void seedWeather() {
        if (weatherInfoRepository.count() == 0) {
            weatherInfoRepository.save(new WeatherInfo(
                "Rampur Village, Ward 1-4", 28.5, "Partly Cloudy & Pleasant", 62,
                14.2, 20, "Optimal (42% Field Capacity)",
                "Favorable weather conditions for field preparation and Rabi sowing. Light morning irrigation recommended for wheat nurseries. No extreme rain alert for next 5 days.",
                "Updated Today, 08:30 AM"
            ));
        }
    }
}
