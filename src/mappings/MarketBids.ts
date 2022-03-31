import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketBids,
  BidAccepted,
  BidEntered,
  BidRefunded,
  BidWithdrawn,
  BlindBidAccepted,
  BlindBidWithdrawn,
  BlindBidentered,
  FundsForwarded
} from "../../generated/MarketBids/MarketBids"
import { User, Stats, NFT, Bid, MarketItem } from "../../generated/schema"
import { getDateString, getTimeString } from '../helpers/datetime';
/*~~~>
  tokenId: token_id of the NFT to be bid on;
  itemId: itemId for internal storage index in the Market Contract;
  bidValue: Value of the bid entered;
  seller: ownerOf NFT;
  <~~~*/
export function handleBidEntered(event: BidEntered): void {

  //Load in and update Stats
  let stats = Stats.load("bid_stats");
  if(!stats){
    stats = new Stats("bid_stats");
    stats.type = "bids"
    stats.count = BigInt.fromI32(0);
  }
  stats.type = "bids";
  stats.count = stats.count + BigInt.fromI32(1);
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);
  // Load in Bid
  let bid = Bid.load("bids_"+event.params.bidder.toString()+event.params.bidId.toString());
  if (!bid) {
    bid = new Bid("bids_"+event.params.bidder.toString()+event.params.bidId.toString());
  }
  bid.type = "listed";
  bid.date = date;
  bid.block = event.block.timestamp;
  bid.item = event.params.seller.toString() + event.params.itemId.toString();
  bid.bidId = event.params.bidId;
  let user = User.load(event.params.seller.toString());

  if(!user){
    let user_stats = Stats.load("user_stats");
    if(!user_stats){
      user_stats = new Stats("user_stats");
      user_stats.count = BigInt.fromI32(0);
    }
    user = new User(event.params.seller.toString());
    user_stats.count = user_stats.count + BigInt.fromI32(1);
    user_stats.type = "users";
    user.block = event.block.timestamp;
    user.date = date;
  }
  user.save();
  bid.bidder = event.params.bidder.toString();
  bid.value = event.params.bidValue;
  bid.isSpecific = true;
  bid.valid = true;

  bid.save()

}

export function handleBidAccepted(event: BidAccepted): void {
  let bid = Bid.load("bids_"+event.params.bidder.toString()+event.params.bidId.toString())
  if(bid){bid.valid = false}
}

export function handleBidWithdrawn(event: BidWithdrawn): void {  
  let bid = Bid.load("bids_"+event.params.bidder.toString()+event.params.bidId.toString())
  if(bid){bid.valid = false}
}

export function handleBlindBidentered(event: BlindBidentered): void {
  let stats = Stats.load("blindBid_stats");

  if(!stats){
    stats = new Stats("blindBid_stats");
    stats.count = BigInt.fromI32(0);
    stats.type = "blindBids"
  }
  stats.count = stats.count + BigInt.fromI32(1);

  let bid = Bid.load("blindBids_"+event.params.bidder.toString()+event.params.blindBidId.toString());

  if (!bid) {
    bid = new Bid("blindBids_"+event.params.bidder.toString()+event.params.blindBidId.toString());
  }
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);
  bid.type = "blind";
  bid.date = date;
  bid.block = event.block.timestamp;
  bid.item = "blindBids_" + event.transaction.from.toString() + event.params.blindBidId.toString();
  bid.bidId = event.params.blindBidId;
  bid.bidder = event.params.bidder.toString();
  bid.value = event.params.bidValue;
  bid.isSpecific = true;
  bid.valid = true;
  bid.save();

  let item = new MarketItem("blindBids_" + event.transaction.from.toString() + event.params.blindBidId.toString());
  item.block = event.block.timestamp;
  item.date = date;
  item.active = true;
  item.user = event.transaction.from.toString();
  item.nft = event.params.collectionBid.toString() + event.params.tokenId.toString()
  item.itemId = event.params.blindBidId;
  item.amount1155 = event.params.amount1155;
  item.save();

  let nft = NFT.load(event.params.collectionBid.toString()+event.params.tokenId.toString());
  if(!nft){
    nft = new NFT(event.params.collectionBid.toString()+event.params.tokenId.toString())
  }
  if(event.params.amount1155 > BigInt.fromI32(0)){
    nft.contract_type = "ERC1155";
  } else {
    nft.contract_type = "ERC721";
  }
  nft.token_id = event.params.tokenId;
  nft.save();
}

export function handleBlindBidAccepted(event: BlindBidAccepted): void {
  let bid = Bid.load("blindBids_"+event.params.bidder.toString()+event.params.blindBidId.toString())
  if(bid){
    bid.valid = false
  }
}

export function handleBlindBidWithdrawn(event: BlindBidWithdrawn): void {
  let bid = Bid.load("blindBids_"+event.params.bidder.toString()+event.params.blindBidId.toString())
  if(bid){bid.valid = false}
}

export function handleBidRefunded(event: BidRefunded): void {
  let bid = Bid.load("bids_"+event.params.bidder.toString()+event.params.bidId.toString())
  if(bid){bid.valid = false}
}

