import type { TransferStatus } from "@/app/generated/prisma/enums"
import type { TransferDirection } from "@/app/api/_dal/transfers-list.dal"
import * as dal from "@/app/api/_dal/transfers-list.dal"

export async function listTransfers(
  query: { direction: TransferDirection; status?: TransferStatus; limit: number; offset: number },
  ctx: { organizationId: string }
) {
  return dal.listTransfers({
    direction: query.direction,
    status: query.status,
    limit: query.limit,
    offset: query.offset,
    organizationId: ctx.organizationId,
  })
}
