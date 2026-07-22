const ADJECTIVES = [
  "Swift",
  "Clever",
  "Brave",
  "Sneaky",
  "Mighty",
  "Jolly",
  "Fuzzy",
  "Silent",
  "Witty",
  "Bold",
  "Happy",
  "Grumpy",
  "Speedy",
  "Lucky",
  "Sly",
  "Fierce",
  "Gentle",
  "Wild",
  "Calm",
  "Daring",
];

const ANIMALS = [
  "Fox",
  "Wolf",
  "Otter",
  "Falcon",
  "Panda",
  "Tiger",
  "Raven",
  "Koala",
  "Shark",
  "Lynx",
  "Bear",
  "Eagle",
  "Hawk",
  "Puma",
  "Cobra",
  "Moose",
  "Rabbit",
  "Badger",
  "Heron",
  "Viper",
  "Gecko",
  "Jaguar",
  "Mantis",
  "Weasel",
  "Osprey",
];

export function getRandomUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adjective}${animal}`;
}
