import { BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { NewOpinion } from '../res/generated/templates/NFTOpinionBase/NFTOpinionBase'
import { IdeamarketPost } from '../res/generated/schema'

import { appendToArray } from './shared'

export function handleOpinion(event: NewOpinion): void {
	let postID = event.tokenID
	if (!postID) {
		throw 'postID does not exist on Opinion event'
	}

	let citationsArray = event.params.citations
	for (let i = 0; i < citationsArray.length; i++) {
		let citation = citationsArray[i]
		let citationRecord = IdeamarketPost.load(citation)
		if (!citationRecord) {
			citationRecord = new IdeamarketPost(citation)
		}

		citationRecord.timesCited = citationRecord.timesCited.plus(1)
		if (!new Set(citationRecord.citedBy).has(postID)) {
			citationRecord.citedBy = appendToArray(citationRecord.citedBy, postID)
		}
		citationRecord.save()
	}
}
