import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";
import { recordItemAction } from "@/lib/audit";
import corsHeaders from "@/lib/cors";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function itemDetails(item) {
  const { name, category, price, amount } = item;
  return { name, category, price, amount };
}

export async function GET(request, { params }) {
  const user = verifyJWT(request);
  if (!user) return errorResponse("Unauthorized Request", 401);
  const { item_id } = await params;
  if (!ObjectId.isValid(item_id)) return errorResponse("Invalid item ID", 400);

  try {
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const item = await db.collection("item").findOne({
      _id: new ObjectId(item_id), status: { $ne: "DELETED" },
    });
    if (!item) return errorResponse("Item not found", 404);
    await recordItemAction(db, user, "READ_ITEM", item._id, itemDetails(item));
    return successResponse({ item }, 201);
  } catch (error) {
    printExceptionLog("GET Item", error);
    return errorResponse("GET Item Internal Error", 500);
  }
}

async function changeItem(request, params, deleting) {
  const user = verifyJWT(request);
  if (!user) return errorResponse("Unauthorized Request", 401);
  const { item_id } = await params;
  if (!ObjectId.isValid(item_id)) return errorResponse("Invalid item ID", 400);

  try {
    const data = deleting ? null : await request.json();
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);
    const found = await client.withSession((session) => session.withTransaction(async () => {
      const filter = { _id: new ObjectId(item_id), status: { $ne: "DELETED" } };
      const item = await db.collection("item").findOne(filter, { session });
      if (!item) return false;
      const changes = deleting ? { status: "DELETED" } : itemDetails(data);
      await db.collection("item").updateOne(filter, { $set: changes }, { session });
      await recordItemAction(db, user, deleting ? "DELETE_ITEM" : "UPDATE_ITEM",
        item._id, deleting ? itemDetails(item) : changes, session);
      return true;
    }));
    if (!found) return errorResponse("Item not found", 404);
    return successResponse({ message: deleting ? "Delete Success" : "Item update success" }, 201);
  } catch (error) {
    printExceptionLog(deleting ? "DELETE Item" : "PUT Item", error);
    return errorResponse("Unable to save item action", 500);
  }
}

export async function DELETE(request, { params }) {
  return changeItem(request, params, true);
}

export async function PUT(request, { params }) {
  return changeItem(request, params, false);
}
