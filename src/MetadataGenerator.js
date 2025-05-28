const crypto = require("crypto");

class MetadataGenerator {
  constructor() {
    this.traits = {
      background: [
        "Blue",
        "Red",
        "Green",
        "Purple",
        "Orange",
        "Pink",
        "Yellow",
        "Black",
        "White",
      ],
      eyes: [
        "Normal",
        "Laser",
        "3D",
        "Zombie",
        "Robot",
        "Alien",
        "Sleepy",
        "Wink",
      ],
      mouth: [
        "Smile",
        "Frown",
        "Open",
        "Tongue",
        "Mustache",
        "Beard",
        "Pipe",
        "Cigar",
      ],
      accessory: [
        "None",
        "Hat",
        "Sunglasses",
        "Earring",
        "Necklace",
        "Bow Tie",
        "Crown",
        "Mask",
      ],
      rarity: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
    };
  }

  generateMetadata(name, description, imageUrl, customAttributes = []) {
    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      external_url: "https://your-website.com",
      attributes: [
        ...this.generateRandomTraits(),
        ...customAttributes,
        {
          trait_type: "Generation",
          value: "Gen 1",
        },
        {
          trait_type: "Created Date",
          value: new Date().toISOString().split("T")[0],
        },
      ],
    };

    return JSON.stringify(metadata, null, 2);
  }

  generateRandomTraits() {
    const attributes = [];

    // Generate random traits
    for (const [traitType, options] of Object.entries(this.traits)) {
      if (traitType === "rarity") continue; // Handle rarity separately

      const randomValue = options[Math.floor(Math.random() * options.length)];
      attributes.push({
        trait_type: this.capitalizeFirst(traitType),
        value: randomValue,
      });
    }

    // Add rarity based on probability
    attributes.push({
      trait_type: "Rarity",
      value: this.generateRarity(),
    });

    // Add random stats
    attributes.push({
      trait_type: "Strength",
      value: Math.floor(Math.random() * 100) + 1,
      max_value: 100,
    });

    attributes.push({
      trait_type: "Speed",
      value: Math.floor(Math.random() * 100) + 1,
      max_value: 100,
    });

    attributes.push({
      trait_type: "Intelligence",
      value: Math.floor(Math.random() * 100) + 1,
      max_value: 100,
    });

    return attributes;
  }

  generateRarity() {
    const rand = Math.random();
    if (rand < 0.01) return "Legendary";
    if (rand < 0.05) return "Epic";
    if (rand < 0.15) return "Rare";
    if (rand < 0.35) return "Uncommon";
    return "Common";
  }

  generateCollectionMetadata(count, baseName, baseDescription, baseImageUrl) {
    const metadataArray = [];

    for (let i = 1; i <= count; i++) {
      const metadata = {
        name: `${baseName} #${i}`,
        description: `${baseDescription} - Edition ${i} of ${count}`,
        image: `${baseImageUrl}${i}.png`,
        external_url: "https://your-website.com",
        attributes: [
          ...this.generateRandomTraits(),
          {
            trait_type: "Edition",
            value: i,
            max_value: count,
          },
          {
            trait_type: "Generation",
            value: "Gen 1",
          },
          {
            trait_type: "Created Date",
            value: new Date().toISOString().split("T")[0],
          },
        ],
      };

      metadataArray.push(metadata);
    }

    return metadataArray;
  }

  generateUniqueMetadata(name, description, imageUrl, seed = null) {
    // Use seed for deterministic generation
    if (seed) {
      Math.seedrandom = require("seedrandom");
      Math.random = Math.seedrandom(seed);
    }

    const uniqueId = crypto.randomBytes(16).toString("hex");

    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      external_url: "https://your-website.com",
      unique_id: uniqueId,
      attributes: [
        ...this.generateRandomTraits(),
        {
          trait_type: "Unique ID",
          value: uniqueId,
        },
        {
          trait_type: "Generation",
          value: "Gen 1",
        },
        {
          trait_type: "Created Date",
          value: new Date().toISOString().split("T")[0],
        },
        {
          trait_type: "Created Time",
          value: new Date().toISOString(),
        },
      ],
    };

    return JSON.stringify(metadata, null, 2);
  }

  generateGameMetadata(name, description, imageUrl, gameStats = {}) {
    const defaultStats = {
      level: 1,
      experience: 0,
      health: 100,
      mana: 50,
      attack: Math.floor(Math.random() * 50) + 10,
      defense: Math.floor(Math.random() * 50) + 10,
      speed: Math.floor(Math.random() * 50) + 10,
      luck: Math.floor(Math.random() * 50) + 10,
    };

    const stats = { ...defaultStats, ...gameStats };

    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      external_url: "https://your-game.com",
      animation_url: `https://your-game.com/animation/${name.replace(/\s+/g, "-").toLowerCase()}`,
      attributes: [
        ...this.generateRandomTraits(),
        {
          trait_type: "Level",
          value: stats.level,
          max_value: 100,
        },
        {
          trait_type: "Experience",
          value: stats.experience,
          max_value: 1000000,
        },
        {
          trait_type: "Health",
          value: stats.health,
          max_value: 100,
        },
        {
          trait_type: "Mana",
          value: stats.mana,
          max_value: 100,
        },
        {
          trait_type: "Attack",
          value: stats.attack,
          max_value: 100,
        },
        {
          trait_type: "Defense",
          value: stats.defense,
          max_value: 100,
        },
        {
          trait_type: "Speed",
          value: stats.speed,
          max_value: 100,
        },
        {
          trait_type: "Luck",
          value: stats.luck,
          max_value: 100,
        },
        {
          trait_type: "Character Class",
          value: this.generateCharacterClass(stats),
        },
      ],
    };

    return JSON.stringify(metadata, null, 2);
  }

  generateCharacterClass(stats) {
    const { attack, defense, speed, luck } = stats;

    if (attack > 40) return "Warrior";
    if (defense > 40) return "Tank";
    if (speed > 40) return "Assassin";
    if (luck > 40) return "Gambler";

    return "Adventurer";
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Validate metadata format
  validateMetadata(metadata) {
    try {
      const parsed =
        typeof metadata === "string" ? JSON.parse(metadata) : metadata;

      const required = ["name", "description", "image"];
      const missing = required.filter((field) => !parsed[field]);

      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(", ")}`);
      }

      if (parsed.attributes && !Array.isArray(parsed.attributes)) {
        throw new Error("Attributes must be an array");
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid metadata format: ${error.message}`);
    }
  }

  // Generate metadata for different NFT types
  generateByType(type, name, description, imageUrl, options = {}) {
    switch (type.toLowerCase()) {
      case "art":
        return this.generateArtMetadata(name, description, imageUrl, options);
      case "game":
        return this.generateGameMetadata(name, description, imageUrl, options);
      case "collectible":
        return this.generateCollectibleMetadata(
          name,
          description,
          imageUrl,
          options
        );
      case "utility":
        return this.generateUtilityMetadata(
          name,
          description,
          imageUrl,
          options
        );
      default:
        return this.generateMetadata(
          name,
          description,
          imageUrl,
          options.customAttributes
        );
    }
  }

  generateArtMetadata(name, description, imageUrl, options = {}) {
    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      external_url: "https://your-art-gallery.com",
      attributes: [
        {
          trait_type: "Artist",
          value: options.artist || "Unknown Artist",
        },
        {
          trait_type: "Medium",
          value: options.medium || "Digital",
        },
        {
          trait_type: "Style",
          value: options.style || this.getRandomArtStyle(),
        },
        {
          trait_type: "Year Created",
          value: options.year || new Date().getFullYear(),
        },
        {
          trait_type: "Dimensions",
          value: options.dimensions || "1920x1080",
        },
        {
          trait_type: "Color Palette",
          value: options.colorPalette || this.getRandomColorPalette(),
        },
      ],
    };

    return JSON.stringify(metadata, null, 2);
  }

  generateCollectibleMetadata(name, description, imageUrl, options = {}) {
    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      external_url: "https://your-collectibles.com",
      attributes: [
        {
          trait_type: "Series",
          value: options.series || "Series 1",
        },
        {
          trait_type: "Edition",
          value: options.edition || 1,
        },
        {
          trait_type: "Condition",
          value: options.condition || "Mint",
        },
        {
          trait_type: "Rarity",
          value: this.generateRarity(),
        },
        {
          trait_type: "Release Date",
          value: options.releaseDate || new Date().toISOString().split("T")[0],
        },
      ],
    };

    return JSON.stringify(metadata, null, 2);
  }

  generateUtilityMetadata(name, description, imageUrl, options = {}) {
    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      external_url: "https://your-utility-platform.com",
      attributes: [
        {
          trait_type: "Utility Type",
          value: options.utilityType || "Access Pass",
        },
        {
          trait_type: "Access Level",
          value: options.accessLevel || "Basic",
        },
        {
          trait_type: "Valid Until",
          value: options.validUntil || "Lifetime",
        },
        {
          trait_type: "Benefits",
          value: options.benefits || "Platform Access",
        },
      ],
    };

    return JSON.stringify(metadata, null, 2);
  }

  getRandomArtStyle() {
    const styles = [
      "Abstract",
      "Realistic",
      "Impressionist",
      "Surreal",
      "Minimalist",
      "Pop Art",
      "Cubist",
    ];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  getRandomColorPalette() {
    const palettes = [
      "Warm",
      "Cool",
      "Monochrome",
      "Vibrant",
      "Pastel",
      "Earth Tones",
      "Neon",
    ];
    return palettes[Math.floor(Math.random() * palettes.length)];
  }
}

module.exports = MetadataGenerator;
