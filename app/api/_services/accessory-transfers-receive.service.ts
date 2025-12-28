import * as dal from "@/app/api/_dal/accessory-transfers-receive.dal"

export async function receiveAccessoryTransfer(ctx: {
  transferId: string
  receiverOrgId: string
  receiverUserId: string
}) {
  return dal.receiveAccessoryTransfer({
    transferId: ctx.transferId,
    receiverOrgId: ctx.receiverOrgId,
    receiverUserId: ctx.receiverUserId,
  })
}
