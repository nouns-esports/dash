import { db } from "~/packages/db";
import { pinataClient } from "../clients/pinata";
import { communities, communityAdmins, communityPlugins } from "~/packages/db/schema/public";
import { eq } from "drizzle-orm";
// import { platforms, type Platforms } from "~/packages/server/plugins";

export type Community = typeof communities.$inferSelect & {
    admins: (typeof communityAdmins.$inferSelect)[];
    plugins: (typeof communityPlugins.$inferSelect)[];
};

// export async function createCommunity<TPlatform extends Platforms>(input: {
//     name: string;
//     image: string;
//     user: string;
//     platform: {
//         id: TPlatform;
//         config: (typeof platforms)[TPlatform]["config"];
//     };
// }) {
//     let community: Community | undefined;

//     await db.primary.transaction(async (tx) => {
//         const image = await pinataClient.upload.url(input.image);

//         const [createdCommunity] = await tx
//             .insert(communities)
//             .values({
//                 handle: input.name.toLowerCase().replace(/ /g, "-"),
//                 name: input.name,
//                 image: image.IpfsHash,
//             })
//             .returning();

//         await tx.insert(communityAdmins).values({
//             community: createdCommunity.id,
//             user: input.user,
//             owner: true,
//         });

//         await tx.insert(communityConnections).values({
//             community: createdCommunity.id,
//             platform: input.platform.id,
//             config: input.platform.config,
//         });

//         community = await tx.query.communities.findFirst({
//             where: eq(communities.id, createdCommunity.id),
//             with: {
//                 admins: true,
//                 connections: true,
//             },
//         });
//     });

//     if (!community) {
//         throw new Error("Failed to create community");
//     }

//     return community;
// }
