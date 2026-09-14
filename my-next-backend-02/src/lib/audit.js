// Store item fields and verified identity, never cookies or passwords.
export function recordItemAction(db, user, action, itemId, details, session) {
  return db.collection("audit_log").insertOne({
    action,
    itemId,
    user: user.username,
    userId: user.id,
    details,
    timestamp: new Date(),
  }, session ? { session } : {});
}
