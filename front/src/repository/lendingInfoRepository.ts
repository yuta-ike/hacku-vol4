import axios from '~/util/axios'
import { BorrowingInfo, LendingInfo } from '~/types/lendingInfo'
import LendingToken from '~/types/lendingToken'
import checkAccessToken from '~/util/checkAccessToken'

/**
 * 貸す物を登録する
 * @params accessToken
 * @params data 登録するデータ
 */
export const postLendingInfo = async (
  accessToken: string,
  data: PostLendingInfoParams,
): Promise<LendingToken> => {
  checkAccessToken(accessToken)
  const res = await axios.post('/lending', data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return res.data.lending_id.toString()
}

export type PostLendingInfoParams = {
  content: string
  deadline: Date
}

/**
 * メッセージの送付完了を報告する
 * @param accessToken アクセストークン
 * @param lendingId 貸し出しID
 */
export const putLendingProcessFinished = async (
  accessToken: string,
  lendingToken: LendingToken,
) => {
  checkAccessToken(accessToken)
  await axios.put(
    `lending/${encodeURIComponent(lendingToken)}/sent-url`,
    {},
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
}

/**
 * 貸し出し情報と借りる人を紐付ける
 */

export const linkLendingInfo = async (
  accessToken: string,
  data: PostLinkInfoParams,
): Promise<BorrowingInfo> => {
  checkAccessToken(accessToken)
  const res = await axios.put(
    `/lending/${encodeURIComponent(data.lendingId)}`,
    data,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  return {
    lendingId: `${res.data.lending_id}`,
    content: res.data.content as string,
    deadline: new Date(res.data.deadline as string),
    ownerName: res.data.owner_name as string,
    kind: 'borrowing',
  } as BorrowingInfo
}

export type PostLinkInfoParams = {
  lendingId: string
}

/**
 * 返却を登録する
 *
 * @params accessToken
 * @params lendingId 貸出ID
 * @return 貸出情報
 */
export const postHaveReturned = async ({
  accessToken,
  lendingId,
}: PostHaveReturnedParams): Promise<LendingInfo> => {
  checkAccessToken(accessToken)
  const res = await axios.delete(`/lending/${lendingId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return {
    lendingId: `${res.data.lending_id}`,
    content: res.data.content as string,
    deadline: new Date(res.data.deadline as string),
    borrowerName: res.data.borrower_name as string,
    kind: 'lending',
  } as LendingInfo
}

export type PostHaveReturnedParams = {
  accessToken: string
  lendingId: string
}

/**
 * 貸しているもの一覧を取得する
 *
 * @params {string} accessToken
 * @return 貸しているもの一覧
 */
export const fetchLendingList = async (
  accessToken: string,
): Promise<LendingInfo[]> => {
  checkAccessToken(accessToken)
  const res = await axios.get('/owner/lending', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const lendingList: Record<string, unknown>[] = res.data.lending_list
  return lendingList.map<LendingInfo>((data) => {
    const lendingInfo = {
      lendingId: `${data.lending_id}`,
      content: data.content as string,
      deadline: new Date(data.deadline as string),
      kind: 'lending' as const,
    }
    if (data.borrower_name != null) {
      return {
        ...lendingInfo,
        borrowerName: data.borrower_name as string,
        status: 'concluded',
      }
    } else {
      return {
        ...lendingInfo,
        status: 'waiting',
      }
    }
  }) as LendingInfo[]
}

/**
 * 借りているもの一覧を取得する
 *
 * @params {string} accessToken
 * @return 借りているもの一覧
 */
export const fetchBorrowingList = async (
  accessToken: string,
): Promise<BorrowingInfo[]> => {
  checkAccessToken(accessToken)
  const res = await axios.get('/borrower/lending', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const borrowingList: Record<string, unknown>[] = res.data.lending_list
  return borrowingList.map((data) => ({
    lendingId: `${data.lending_id}`,
    content: data.content as string,
    deadline: new Date(data.deadline as string),
    ownerName: data.owner_name as string,
    kind: 'borrowing',
  })) as BorrowingInfo[]
}

/**
 * 貸しているもの、借りているものの一覧を合わせて取得する
 *
 * @param {string} accessToken
 * @return 借りているもの、貸しているもの一覧
 */
export const fetchLendingAndBorrowingList = async (
  accessToken: string,
): Promise<(LendingInfo | BorrowingInfo)[]> => {
  const [lendingList, borrowingList] = await Promise.all([
    fetchLendingList(accessToken),
    fetchBorrowingList(accessToken),
  ])
  return [...lendingList, ...borrowingList]
}

/**
 * 貸し出しトークンから貸出情報を取得するURL
 * @param accessToken アクセストークン
 * @param lendingToken 貸し出しトークン
 */
export const getBorrowingInfoFromToken = async (
  accessToken: string,
  lendingToken: LendingToken,
): Promise<GetBorrowingInfoFromTokenResponse> => {
  checkAccessToken(accessToken)
  try {
    const res = await axios.get(
      `/lending/${encodeURIComponent(lendingToken)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )
    return {
      lendingId: `${res.data.lending_id}`,
      content: res.data.content as string,
      deadline: new Date(res.data.deadline as string),
      ownerName: res.data.owner_name as string,
      isAssociated: res.data.is_associated as boolean,
      kind: 'borrowing',
    }
  } catch (e) {
    console.log(e)
    if (e.error_code === 'Not Found') {
      throw new LendingTokenNotFoundError()
    }
    throw e
  }
}

export type GetBorrowingInfoFromTokenResponse = BorrowingInfo & {
  isAssociated: boolean
}

export class LendingTokenNotFoundError extends Error {}

/**
 * 貸し出し情報の借り手として自分を登録する
 * @param accessToken アクセストークン
 * @param lendingToken 貸し出しトークン
 */
export const linkAsBorrower = async (
  accessToken: string,
  lendingToken: LendingToken,
) => {
  const res = await axios.put(
    `lending/${encodeURIComponent(lendingToken)}`,
    {},
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  return {
    isNewUser: res.data.is_new_user as boolean,
    borrowingInfo: {
      lendingId: `${res.data.lending_id}`,
      content: res.data.content as string,
      deadline: new Date(res.data.deadline as string),
      ownerName: res.data.owner_name as string,
      kind: 'borrowing',
    } as BorrowingInfo,
  }
}

export type LinkAsBorrowerResponse = {
  isNewUser: boolean
  borrowingInfo: BorrowingInfo
}
