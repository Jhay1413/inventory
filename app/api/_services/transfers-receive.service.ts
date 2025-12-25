import * as dal from "@/app/api/_dal/transfers-receive.dal"

export async function receiveTransfer(ctx: {
  transferId: string
  receiverOrgId: string
  receiverUserId: string
}) {
  return dal.receiveTransfer({
    transferId: ctx.transferId,
    receiverOrgId: ctx.receiverOrgId,
    receiverUserId: ctx.receiverUserId,
  })
}
