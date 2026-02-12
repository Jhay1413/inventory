import type { TransferStatus } from "@/app/generated/prisma/enums"
import type { TransferDirection } from "@/app/api/_dal/transfers-list.dal"
import * as dal from "@/app/api/_dal/transfers-list.dal"

export async function listTransfers(
  query: { direction: TransferDirection; status?: TransferStatus; statusNot?: TransferStatus; search?: string; limit: number; offset: number },
  ctx: { organizationId: string }
) {
  return dal.listTransfers({
    direction: query.direction,
    status: query.status,
    statusNot: query.statusNot,
    search: query.search,
    limit: query.limit,
    offset: query.offset,
    organizationId: ctx.organizationId,
  })
}
