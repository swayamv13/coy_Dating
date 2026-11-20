"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProfiles = seedProfiles;
const connection_1 = require("../database/connection");
const profiles = [
    { name: "Aarav Mehta", email: "aarav@example.com", age: 27, gender: "Man", bio: "Product designer who loves coffee, live music, and weekend hikes.", location: "Bengaluru", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", interests: ["Design", "Music", "Hiking"] },
    { name: "Ananya Rao", email: "ananya@example.com", age: 25, gender: "Woman", bio: "Food blogger finding the best chai in the city.", location: "Mumbai", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", interests: ["Food", "Travel", "Photography"] },
    { name: "Vihaan Kapoor", email: "vihaan@example.com", age: 29, gender: "Man", bio: "Software engineer, amateur cyclist, and enthusiastic cook.", location: "Pune", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", interests: ["Cycling", "Cooking", "Technology"] },
    { name: "Ishita Sen", email: "ishita@example.com", age: 26, gender: "Woman", bio: "Architect with a soft spot for bookstores and architecture walks.", location: "Delhi", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb", interests: ["Books", "Architecture", "Walking"] },
    { name: "Kabir Shah", email: "kabir@example.com", age: 28, gender: "Man", bio: "Sports photographer and part-time badminton player.", location: "Ahmedabad", photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d", interests: ["Photography", "Badminton", "Travel"] },
    { name: "Meera Nair", email: "meera@example.com", age: 24, gender: "Woman", bio: "Dance teacher who believes every day deserves good music.", location: "Chennai", photoUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce", interests: ["Dance", "Music", "Fitness"] },
    { name: "Rohan Das", email: "rohan@example.com", age: 30, gender: "Man", bio: "Startup founder, runner, and recovering coffee snob.", location: "Kolkata", photoUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128", interests: ["Startups", "Running", "Coffee"] },
    { name: "Saanvi Iyer", email: "saanvi@example.com", age: 27, gender: "Woman", bio: "Marine biologist with a suitcase always ready for the coast.", location: "Goa", photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1", interests: ["Ocean", "Travel", "Wildlife"] },
    { name: "Arjun Bose", email: "arjun@example.com", age: 26, gender: "Man", bio: "Musician building playlists for every possible mood.", location: "Bengaluru", photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea", interests: ["Music", "Guitar", "Concerts"] },
    { name: "Diya Patel", email: "diya@example.com", age: 23, gender: "Woman", bio: "UX researcher, plant parent, and casual potter.", location: "Surat", photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9", interests: ["Plants", "Pottery", "Research"] },
    { name: "Aditya Kulkarni", email: "aditya@example.com", age: 31, gender: "Man", bio: "Finance professional who traded spreadsheets for mountain trails.", location: "Mumbai", photoUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3", interests: ["Finance", "Trekking", "Cinema"] },
    { name: "Navya Gupta", email: "navya@example.com", age: 28, gender: "Woman", bio: "Illustrator inspired by street art and Sunday markets.", location: "Jaipur", photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e", interests: ["Art", "Markets", "Illustration"] },
    { name: "Dev Malhotra", email: "dev@example.com", age: 27, gender: "Man", bio: "Chef experimenting with fusion desserts and old recipes.", location: "Delhi", photoUrl: "https://images.unsplash.com/photo-1509460913899-515f1df34fea", interests: ["Cooking", "Baking", "Dining"] },
    { name: "Tara Reddy", email: "tara@example.com", age: 25, gender: "Woman", bio: "Journalist, museum regular, and devoted cat person.", location: "Hyderabad", photoUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df", interests: ["Writing", "Museums", "Cats"] },
    { name: "Neel Joshi", email: "neel@example.com", age: 29, gender: "Man", bio: "Film editor who can quote too many movies.", location: "Mumbai", photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7", interests: ["Movies", "Editing", "Theater"] },
    { name: "Kiara Singh", email: "kiara@example.com", age: 26, gender: "Woman", bio: "Yoga instructor, sunrise chaser, and smoothie enthusiast.", location: "Rishikesh", photoUrl: "https://images.unsplash.com/photo-1526510747491-58f928ec870f", interests: ["Yoga", "Wellness", "Hiking"] },
    { name: "Vivaan Chatterjee", email: "vivaan@example.com", age: 32, gender: "Man", bio: "Data scientist planning the next hiking adventure.", location: "Kolkata", photoUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f", interests: ["Data", "Hiking", "Chess"] },
    { name: "Riya Verma", email: "riya@example.com", age: 24, gender: "Woman", bio: "Content creator sharing small joys and big daydreams.", location: "Lucknow", photoUrl: "https://images.unsplash.com/photo-1514315384763-ba401779410f", interests: ["Content", "Fashion", "Travel"] },
    { name: "Yash Bhat", email: "yash@example.com", age: 28, gender: "Man", bio: "Game developer by day and table-top strategist by night.", location: "Pune", photoUrl: "https://images.unsplash.com/photo-1531386450457-58bba07b3f65", interests: ["Gaming", "Strategy", "Anime"] },
    { name: "Lavanya Menon", email: "lavanya@example.com", age: 30, gender: "Woman", bio: "Doctor who enjoys beaches and a very competitive board game.", location: "Kochi", photoUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43", interests: ["Medicine", "Board Games", "Beaches"] },
    { name: "Om Prakash", email: "om@example.com", age: 25, gender: "Man", bio: "Civil engineer learning classical piano in his free time.", location: "Varanasi", photoUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598", interests: ["Engineering", "Piano", "History"] },
    { name: "Avni Sharma", email: "avni@example.com", age: 27, gender: "Woman", bio: "Marketing strategist and enthusiastic festival explorer.", location: "Chandigarh", photoUrl: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe", interests: ["Marketing", "Festivals", "Dance"] },
    { name: "Siddharth Roy", email: "siddharth@example.com", age: 29, gender: "Man", bio: "Environmental consultant with a passion for open roads.", location: "Mysuru", photoUrl: "https://images.unsplash.com/photo-1506086679523-8b6c9b7f32a7", interests: ["Environment", "Driving", "Camping"] },
    { name: "Myra Jain", email: "myra@example.com", age: 26, gender: "Woman", bio: "Fashion designer inspired by color, craft, and conversation.", location: "Delhi", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2", interests: ["Fashion", "Craft", "Culture"] },
    { name: "Ishan Arora", email: "ishan@example.com", age: 28, gender: "Man", bio: "Speech therapist and weekend drummer.", location: "Gurugram", photoUrl: "https://images.unsplash.com/photo-1503551723145-6c040742065b", interests: ["Music", "Drums", "Wellness"] },
    { name: "Naina Khanna", email: "naina@example.com", age: 31, gender: "Woman", bio: "Tech lead balancing code reviews with stand-up comedy.", location: "Bengaluru", photoUrl: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56", interests: ["Comedy", "Technology", "Running"] },
    { name: "Reyansh Gill", email: "reyansh@example.com", age: 27, gender: "Man", bio: "Wildlife volunteer and documentary film fan.", location: "Dehradun", photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6", interests: ["Wildlife", "Documentaries", "Outdoors"] },
    { name: "Zoya Khan", email: "zoya@example.com", age: 25, gender: "Woman", bio: "Barista and calligraphy hobbyist chasing beautiful details.", location: "Hyderabad", photoUrl: "https://images.unsplash.com/photo-1546967191-fdfb13ed6b1e", interests: ["Coffee", "Calligraphy", "Art"] },
    { name: "Harsh Saxena", email: "harsh@example.com", age: 30, gender: "Man", bio: "Product manager who hosts trivia nights with friends.", location: "Noida", photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12", interests: ["Trivia", "Products", "Sports"] },
    { name: "Prisha Sethi", email: "prisha@example.com", age: 24, gender: "Woman", bio: "Student, podcast host, and enthusiastic baker.", location: "Mumbai", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop", interests: ["Podcasting", "Baking", "Learning"] },
];
function seedProfiles() {
    const existingUsers = connection_1.db.prepare("SELECT COUNT(*) AS count FROM users").get();
    const insertUser = connection_1.db.prepare("INSERT OR IGNORE INTO users (name, email) VALUES (?, ?)");
    const insertProfile = connection_1.db.prepare(`
    INSERT OR IGNORE INTO profiles (user_id, age, gender, bio, location, photo_url, interests)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
    const transaction = connection_1.db.transaction(() => {
        insertUser.run("Test User", "test.user@example.com");
        const testUser = connection_1.db.prepare("SELECT id FROM users WHERE email = ?").get("test.user@example.com");
        insertProfile.run(testUser.id, 26, "Person", "I'm the Coy Discover test account, here to explore mutual matches.", "Bengaluru", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", JSON.stringify(["Technology", "Music", "Travel"]));
        if (existingUsers.count === 0) {
            for (const profile of profiles) {
                const result = insertUser.run(profile.name, profile.email);
                insertProfile.run(Number(result.lastInsertRowid), profile.age, profile.gender, profile.bio, profile.location, profile.photoUrl, JSON.stringify(profile.interests));
            }
            if (testUser.id !== 1) {
                throw new Error("The temporary test user must have ID 1.");
            }
        }
    });
    transaction();
}
