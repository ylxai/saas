// test-typescript.ts
// File sederhana untuk menguji konfigurasi TypeScript

interface TestInterface {
  id: number;
  name: string;
  isActive: boolean;
}

const testData: TestInterface = {
  id: 1,
  name: "Test",
  isActive: true
};

function processData(data: TestInterface): string {
  return `ID: ${data.id}, Name: ${data.name}, Active: ${data.isActive}`;
}

console.log(processData(testData));

// Tes generics
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("Hello TypeScript!");
console.log(result);

// Tes dengan Zod
import { z } from 'zod';

const UserSchema = z.object({
  username: z.string().min(1),
  age: z.number().min(0).max(120),
});

type User = z.infer<typeof UserSchema>;

const userData = {
  username: "john_doe",
  age: 30,
};

const validatedUser = UserSchema.parse(userData);
console.log("Validated user:", validatedUser);
