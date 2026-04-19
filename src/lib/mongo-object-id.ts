/** Prisma MongoDB ObjectId string (24 hex chars). */
export function isMongoObjectId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id.trim());
}
