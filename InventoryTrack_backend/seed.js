const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/business_track');
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Define Schemas (matching your models)
const UserSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, required: true, unique: true },
  phone_number: String,
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: String,
}, { timestamps: true });

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  unit_price: { type: Number, required: true },
  minimum_stock: { type: Number, required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact_number: { type: String, required: true },
  products: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: { type: Number, required: true },
});

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  selling_price: { type: Number, required: true },
  ingredients: [IngredientSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const StockSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: { type: Number, default: 0 },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const StockTransactionSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: { type: Number, required: true },
  transaction_type: { type: String, enum: ['in', 'out'], required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const ProductionItemSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
  quantityUsed: { type: Number, required: true },
  unit: { type: String, required: true },
});

const ProductionSchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
  batchQuantity: { type: Number, required: true },
  estimatedOutput: { type: Number, required: true },
  actualOutput: Number,
  wastage: { type: Number, default: 0 },
  itemsUsed: [ProductionItemSchema],
  status: { type: String, enum: ["ongoing", "completed"], default: "completed" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Models
const User = mongoose.model('User', UserSchema);
const Material = mongoose.model('Material', MaterialSchema);
const Supplier = mongoose.model('Supplier', SupplierSchema);
const Recipe = mongoose.model('Recipe', RecipeSchema);
const Stock = mongoose.model('Stock', StockSchema);
const StockTransaction = mongoose.model('StockTransaction', StockTransactionSchema);
const Production = mongoose.model('Production', ProductionSchema);

// Seed Data
// This script ADDS demo data without deleting existing records
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("\n🌱 Adding seed data to database (existing data will NOT be deleted)...\n");

    // 1. Create or Find User
    console.log("Looking for existing user...");
    let user = await User.findOne({ email: "shahiandy123@gmail.com" });
    
    if (user) {
      console.log(`✓ User already exists: ${user.fullname}`);
    } else {
      console.log("Creating new user...");
      const hashedPassword = await bcrypt.hash("rain123", 10);
      user = await User.create({
        fullname: "Andresh Shahi",
        email: "shahiandy123@gmail.com",
        phone_number: "+977-9876543210",
        password: hashedPassword,
        role: "user",
      });
      console.log(`✓ User created: ${user.fullname}`);
    }

    // 2. Create Materials
    console.log("Creating materials...");
    const materialsData = [
      { name: "Butter", unit: "kg", unit_price: 850, minimum_stock: 5, description: "Premium quality butter" },
      { name: "Apple", unit: "kg", unit_price: 180, minimum_stock: 10, description: "Fresh red apples" },
      { name: "Flour", unit: "kg", unit_price: 65, minimum_stock: 50, description: "All-purpose flour" },
      { name: "Eggs", unit: "dozen", unit_price: 220, minimum_stock: 20, description: "Farm fresh eggs" },
      { name: "Sugar", unit: "kg", unit_price: 90, minimum_stock: 30, description: "White granulated sugar" },
      { name: "Milk", unit: "liter", unit_price: 110, minimum_stock: 15, description: "Fresh whole milk" },
      { name: "Cream Cheese", unit: "kg", unit_price: 950, minimum_stock: 5, description: "Philadelphia cream cheese" },
      { name: "Vanilla Extract", unit: "ml", unit_price: 15, minimum_stock: 500, description: "Pure vanilla extract" },
      { name: "Cinnamon", unit: "gm", unit_price: 8, minimum_stock: 200, description: "Ground cinnamon" },
      { name: "Cocoa Powder", unit: "kg", unit_price: 680, minimum_stock: 10, description: "Premium cocoa powder" },
      { name: "Baking Powder", unit: "gm", unit_price: 3, minimum_stock: 500, description: "Double acting baking powder" },
      { name: "Salt", unit: "kg", unit_price: 25, minimum_stock: 10, description: "Iodized salt" },
    ];

    const materials = await Material.insertMany(
      materialsData.map(m => ({ ...m, user: user._id }))
    );
    console.log(`✓ ${materials.length} materials created`);

    // Create a map for easy material lookup
    const materialMap = {};
    materials.forEach(m => {
      materialMap[m.name] = m;
    });

    // 3. Create Suppliers
    console.log("Creating suppliers...");
    const suppliersData = [
      { name: "Fresh Farm Supplies", email: "contact@freshfarm.com", contact_number: "9801234567", products: ["eggs", "milk", "butter"] },
      { name: "Golden Grain Co.", email: "info@goldengrain.com", contact_number: "9801234568", products: ["flour", "sugar", "salt"] },
      { name: "Alpine Dairy", email: "sales@alpinedairy.com", contact_number: "9801234569", products: ["milk", "butter", "cream cheese"] },
      { name: "Organic Valley", email: "orders@organicvalley.com", contact_number: "9801234570", products: ["eggs", "milk"] },
      { name: "Baker's Paradise", email: "supply@bakersparadise.com", contact_number: "9801234571", products: ["flour", "baking powder", "vanilla extract"] },
      { name: "Fruit Basket Ltd", email: "wholesale@fruitbasket.com", contact_number: "9801234572", products: ["apple", "cinnamon"] },
      { name: "Premium Ingredients", email: "contact@premiumingredients.com", contact_number: "9801234573", products: ["cocoa powder", "vanilla extract", "cream cheese"] },
      { name: "Daily Essentials", email: "info@dailyessentials.com", contact_number: "9801234574", products: ["eggs", "sugar", "salt"] },
      { name: "Natural Harvest", email: "sales@naturalharvest.com", contact_number: "9801234575", products: ["flour", "apple", "cinnamon"] },
      { name: "Quality Foods", email: "orders@qualityfoods.com", contact_number: "9801234576", products: ["butter", "milk", "eggs"] },
    ];

    const suppliers = await Supplier.insertMany(
      suppliersData.map(s => ({ ...s, user: user._id }))
    );
    console.log(`✓ ${suppliers.length} suppliers created`);

    // 4. Create Recipes
    console.log("Creating recipes...");
    const recipes = await Recipe.insertMany([
      {
        name: "Apple Pie",
        description: "Classic homemade apple pie with cinnamon",
        selling_price: 1500,
        ingredients: [
          { name: "Flour", material: materialMap["Flour"]._id, quantity: 0.5 },
          { name: "Butter", material: materialMap["Butter"]._id, quantity: 0.2 },
          { name: "Apple", material: materialMap["Apple"]._id, quantity: 1.5 },
          { name: "Sugar", material: materialMap["Sugar"]._id, quantity: 0.3 },
          { name: "Cinnamon", material: materialMap["Cinnamon"]._id, quantity: 10 },
          { name: "Eggs", material: materialMap["Eggs"]._id, quantity: 0.25 },
        ],
        user: user._id,
      },
      {
        name: "Cheesecake",
        description: "Rich and creamy New York style cheesecake",
        selling_price: 2200,
        ingredients: [
          { name: "Cream Cheese", material: materialMap["Cream Cheese"]._id, quantity: 0.8 },
          { name: "Sugar", material: materialMap["Sugar"]._id, quantity: 0.4 },
          { name: "Eggs", material: materialMap["Eggs"]._id, quantity: 0.33 },
          { name: "Vanilla Extract", material: materialMap["Vanilla Extract"]._id, quantity: 10 },
          { name: "Flour", material: materialMap["Flour"]._id, quantity: 0.1 },
          { name: "Butter", material: materialMap["Butter"]._id, quantity: 0.15 },
        ],
        user: user._id,
      },
      {
        name: "Chocolate Cake",
        description: "Moist chocolate layer cake with rich frosting",
        selling_price: 1800,
        ingredients: [
          { name: "Flour", material: materialMap["Flour"]._id, quantity: 0.4 },
          { name: "Sugar", material: materialMap["Sugar"]._id, quantity: 0.5 },
          { name: "Cocoa Powder", material: materialMap["Cocoa Powder"]._id, quantity: 0.15 },
          { name: "Eggs", material: materialMap["Eggs"]._id, quantity: 0.25 },
          { name: "Milk", material: materialMap["Milk"]._id, quantity: 0.3 },
          { name: "Butter", material: materialMap["Butter"]._id, quantity: 0.2 },
          { name: "Baking Powder", material: materialMap["Baking Powder"]._id, quantity: 15 },
          { name: "Vanilla Extract", material: materialMap["Vanilla Extract"]._id, quantity: 10 },
        ],
        user: user._id,
      },
      {
        name: "Butter Cookies",
        description: "Classic buttery shortbread cookies",
        selling_price: 800,
        ingredients: [
          { name: "Flour", material: materialMap["Flour"]._id, quantity: 0.3 },
          { name: "Butter", material: materialMap["Butter"]._id, quantity: 0.2 },
          { name: "Sugar", material: materialMap["Sugar"]._id, quantity: 0.15 },
          { name: "Vanilla Extract", material: materialMap["Vanilla Extract"]._id, quantity: 5 },
          { name: "Salt", material: materialMap["Salt"]._id, quantity: 2 },
        ],
        user: user._id,
      },
      {
        name: "Vanilla Cupcakes",
        description: "Fluffy vanilla cupcakes with buttercream frosting",
        selling_price: 1200,
        ingredients: [
          { name: "Flour", material: materialMap["Flour"]._id, quantity: 0.35 },
          { name: "Sugar", material: materialMap["Sugar"]._id, quantity: 0.3 },
          { name: "Butter", material: materialMap["Butter"]._id, quantity: 0.15 },
          { name: "Eggs", material: materialMap["Eggs"]._id, quantity: 0.25 },
          { name: "Milk", material: materialMap["Milk"]._id, quantity: 0.2 },
          { name: "Baking Powder", material: materialMap["Baking Powder"]._id, quantity: 12 },
          { name: "Vanilla Extract", material: materialMap["Vanilla Extract"]._id, quantity: 8 },
        ],
        user: user._id,
      },
    ]);
    console.log(`✓ ${recipes.length} recipes created`);

    // 5. Create Initial Stock with Transactions
    console.log("Creating stock and transactions...");
    const stockData = [
      { material: "Butter", initialQty: 15, transactions: [
        { qty: 20, type: "in", desc: "Purchase from Alpine Dairy", daysAgo: 8 },
        { qty: 5, type: "out", desc: "Used in production", daysAgo: 5 },
      ]},
      { material: "Apple", initialQty: 25, transactions: [
        { qty: 30, type: "in", desc: "Purchase from Fruit Basket Ltd", daysAgo: 7 },
        { qty: 5, type: "out", desc: "Used in Apple Pie production", daysAgo: 4 },
      ]},
      { material: "Flour", initialQty: 75, transactions: [
        { qty: 100, type: "in", desc: "Bulk purchase from Golden Grain Co.", daysAgo: 10 },
        { qty: 15, type: "out", desc: "Used in various recipes", daysAgo: 6 },
        { qty: 10, type: "out", desc: "Production batch", daysAgo: 3 },
      ]},
      { material: "Eggs", initialQty: 35, transactions: [
        { qty: 40, type: "in", desc: "Fresh delivery from Fresh Farm", daysAgo: 9 },
        { qty: 5, type: "out", desc: "Cheesecake production", daysAgo: 5 },
      ]},
      { material: "Sugar", initialQty: 45, transactions: [
        { qty: 50, type: "in", desc: "Purchase from Golden Grain Co.", daysAgo: 12 },
        { qty: 5, type: "out", desc: "Production use", daysAgo: 4 },
      ]},
      { material: "Milk", initialQty: 22, transactions: [
        { qty: 25, type: "in", desc: "Daily delivery from Alpine Dairy", daysAgo: 8 },
        { qty: 3, type: "out", desc: "Cake production", daysAgo: 5 },
      ]},
      { material: "Cream Cheese", initialQty: 8, transactions: [
        { qty: 10, type: "in", desc: "Premium purchase", daysAgo: 6 },
        { qty: 2, type: "out", desc: "Cheesecake batch", daysAgo: 3 },
      ]},
      { material: "Vanilla Extract", initialQty: 850, transactions: [
        { qty: 1000, type: "in", desc: "Stock refill from Baker's Paradise", daysAgo: 15 },
        { qty: 150, type: "out", desc: "Multiple productions", daysAgo: 7 },
      ]},
      { material: "Cinnamon", initialQty: 180, transactions: [
        { qty: 200, type: "in", desc: "Spice purchase", daysAgo: 20 },
        { qty: 20, type: "out", desc: "Apple pie production", daysAgo: 4 },
      ]},
      { material: "Cocoa Powder", initialQty: 12, transactions: [
        { qty: 15, type: "in", desc: "Premium cocoa from Premium Ingredients", daysAgo: 11 },
        { qty: 3, type: "out", desc: "Chocolate cake batch", daysAgo: 5 },
      ]},
      { material: "Baking Powder", initialQty: 420, transactions: [
        { qty: 500, type: "in", desc: "Bulk purchase", daysAgo: 18 },
        { qty: 80, type: "out", desc: "Various baking", daysAgo: 8 },
      ]},
      { material: "Salt", initialQty: 9, transactions: [
        { qty: 10, type: "in", desc: "Regular stock", daysAgo: 25 },
        { qty: 1, type: "out", desc: "General use", daysAgo: 10 },
      ]},
    ];

    for (const stockItem of stockData) {
      const material = materialMap[stockItem.material];
      
      // Create stock entry
      await Stock.create({
        material: material._id,
        quantity: stockItem.initialQty,
        description: `Current stock for ${stockItem.material}`,
        user: user._id,
      });

      // Create transactions
      for (const trans of stockItem.transactions) {
        const transDate = new Date();
        transDate.setDate(transDate.getDate() - trans.daysAgo);
        
        await StockTransaction.create({
          material: material._id,
          quantity: trans.qty,
          transaction_type: trans.type,
          description: trans.desc,
          user: user._id,
          createdAt: transDate,
          updatedAt: transDate,
        });
      }
    }
    console.log(`✓ Stock and transactions created`);

    // 6. Create Production History (last 7 days)
    console.log("Creating production history...");
    const productions = [];
    
    // Function to calculate wastage percentage
    const getWastage = () => (Math.random() * (5 - 3) + 3).toFixed(2);

    const productionSchedule = [
      { recipe: recipes[0], batchQty: 10, daysAgo: 1 }, // Apple Pie
      { recipe: recipes[1], batchQty: 8, daysAgo: 2 },  // Cheesecake
      { recipe: recipes[2], batchQty: 12, daysAgo: 3 }, // Chocolate Cake
      { recipe: recipes[3], batchQty: 20, daysAgo: 3 }, // Butter Cookies
      { recipe: recipes[0], batchQty: 15, daysAgo: 4 }, // Apple Pie
      { recipe: recipes[4], batchQty: 24, daysAgo: 5 }, // Vanilla Cupcakes
      { recipe: recipes[2], batchQty: 10, daysAgo: 5 }, // Chocolate Cake
      { recipe: recipes[1], batchQty: 6, daysAgo: 6 },  // Cheesecake
      { recipe: recipes[3], batchQty: 25, daysAgo: 6 }, // Butter Cookies
      { recipe: recipes[0], batchQty: 12, daysAgo: 7 }, // Apple Pie
      { recipe: recipes[4], batchQty: 18, daysAgo: 7 }, // Vanilla Cupcakes
    ];

    for (const prod of productionSchedule) {
      const wastagePercent = parseFloat(getWastage());
      const estimatedOutput = prod.batchQty;
      const actualOutput = Math.floor(estimatedOutput * (1 - wastagePercent / 100));
      
      const itemsUsed = prod.recipe.ingredients.map(ing => ({
        material: ing.material,
        quantityUsed: ing.quantity * prod.batchQty,
        unit: materials.find(m => m._id.equals(ing.material)).unit,
      }));

      const prodDate = new Date();
      prodDate.setDate(prodDate.getDate() - prod.daysAgo);
      prodDate.setHours(8, 0, 0, 0); // Set to 8 AM

      await Production.create({
        recipe: prod.recipe._id,
        batchQuantity: prod.batchQty,
        estimatedOutput: estimatedOutput,
        actualOutput: actualOutput,
        wastage: wastagePercent,
        itemsUsed: itemsUsed,
        status: "completed",
        user: user._id,
        created_at: prodDate,
        updated_at: prodDate,
      });
    }
    console.log(`✓ ${productionSchedule.length} production records created`);

    console.log("\n✅ Seed data added successfully!");
    console.log("\n📊 Summary of added data:");
    console.log(`   - User: ${user.fullname} (${user.email})`);
    console.log(`   - Materials: ${materials.length}`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Recipes: ${recipes.length}`);
    console.log(`   - Production Batches: ${productionSchedule.length}`);
    console.log(`   - Stock Items: ${stockData.length}`);
    console.log("\n🔑 Demo Login Credentials:");
    console.log(`   Email: shahiandy123@gmail.com`);
    console.log(`   Password: rain123`);
    console.log("\n📝 Note: Your existing data was preserved");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
