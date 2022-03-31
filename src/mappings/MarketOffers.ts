import { BigInt } from "@graphprotocol/graph-ts"
import {
  MarketOffers,
  BlindOfferWithdrawn,
  BlindOffered,
  FundsForwarded,
  OfferAccepted,
  OfferRefunded,
  OfferWithdrawn,
  Offered
} from "../../generated/MarketOffers/MarketOffers"
import {User, Stats, Offer, NFT, Token } from "../../generated/schema"
import { getDateString, getTimeString } from "../helpers/datetime";
import { ERC20 } from "../../generated/MarketOffers/ERC20";


export function handleOffered(event: Offered): void {
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);

  let stats = Stats.load("offer_stats");
  if(!stats){
    stats = new Stats("offer_stats");
    stats.type = "offers";
    stats.count = BigInt.fromI32(0)
  }
  stats.count = stats.count + BigInt.fromI32(1);

  let user = User.load(event.params.offerer.toString());
  if(!user){
    let user_stats = Stats.load("user_stats");
    if(!user_stats){
      user_stats = new Stats("user_stats");
      user_stats.count = BigInt.fromI32(0);
    }
    user = new User(event.params.offerer.toString());
    user_stats.count = user_stats.count + BigInt.fromI32(1);
    user_stats.type = "users";
    user.block = event.block.timestamp;
    user.date = date;
  }
  user.save();

  let offer = Offer.load(event.params.offerer.toString()+event.params.offerId.toString());
  if (!offer) {
    offer = new Offer(event.params.offerer.toString()+event.params.offerId.toString());
  }
  offer.type = "listed";
  offer.date = date;
  offer.block = event.block.timestamp;
  offer.item = event.params.seller.toString() + event.params.itemId.toString();
  offer.offerId = event.params.offerId;
  offer.offerer = event.params.offerer.toString();
  offer.isSpecific = true;
  
  let token = Token.load(event.params.token_address.toString())
  if(!token){
    token = new Token(event.params.token_address.toString());
    token.token_address = event.params.token_address;
    let contract = ERC20.bind(event.params.token_address);
    let name = contract.try_name();
    if(!name.reverted){
      token.name = name.value;
    }
    let symbol = contract.try_symbol();
    if(!symbol.reverted){
      token.symbol = symbol.value;
    }
    let decimals = contract.try_decimals();
    if(!decimals.reverted){
      token.decimals = BigInt.fromI32(decimals.value);
    }
  }

  offer.token = event.params.token_address.toString();
  offer.amount = event.params.amount;
  offer.valid = true;
  offer.save()
}

export function handleOfferWithdrawn(event: OfferWithdrawn): void {
  let offer = Offer.load(event.params.offerer.toString()+event.params.offerId.toString())
  if(!offer){
    offer = new Offer(event.params.offerer.toString()+event.params.offerId.toString());
  }
  offer.valid = false;
}

export function handleBlindOffered(event: BlindOffered): void {
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);

  let stats = Stats.load("offer_stats");
  if(!stats){
    stats = new Stats("offer_stats");
    stats.type = "offers";
    stats.count = BigInt.fromI32(0)
  }
  stats.count = stats.count + BigInt.fromI32(1);

  let user = User.load(event.params.offerer.toString());
  if(!user){
    let user_stats = Stats.load("user_stats");
    if(!user_stats){
      user_stats = new Stats("user_stats");
      user_stats.count = BigInt.fromI32(0);
    }
    user = new User(event.params.offerer.toString());
    user_stats.count = user_stats.count + BigInt.fromI32(1);
    user_stats.type = "users";
    user.block = event.block.timestamp;
    user.date = date;
  }
  user.save();

  let offer = Offer.load(event.params.offerer.toString()+event.params.offerId.toString());
  if (!offer) {
    offer = new Offer(event.params.offerer.toString()+event.params.offerId.toString());
  }
  offer.type = "blind";
  offer.date = date;
  offer.block = event.block.timestamp;
  offer.offerId = event.params.offerId;
  offer.offerer = event.params.offerer.toString();
  offer.isSpecific = true;
  
  let token = Token.load(event.params.collectionOffer.toString())
  if(!token){
    token = new Token(event.params.collectionOffer.toString());
    token.token_address = event.params.collectionOffer;
    let contract = ERC20.bind(event.params.collectionOffer);
    let name = contract.try_name();
    if(!name.reverted){
      token.name = name.value;
    }
    let symbol = contract.try_symbol();
    if(!symbol.reverted){
      token.symbol = symbol.value;
    }
    let decimals = contract.try_decimals();
    if(!decimals.reverted){
      token.decimals = BigInt.fromI32(decimals.value);
    }
  }

  offer.token = event.params.collectionOffer.toString();
  offer.amount = event.params.amount;
  offer.valid = true;
  offer.save()
}

export function handleBlindOfferWithdrawn(event: BlindOfferWithdrawn): void {
  let offer = Offer.load(event.params.offerer.toString()+event.params.offerId.toString())
  if(!offer){
    offer = new Offer(event.params.offerer.toString()+event.params.offerId.toString());
  }
  offer.valid = false;
}

export function handleOfferAccepted(event: OfferAccepted): void {
  let offer = Offer.load(event.params.offerer.toString()+event.params.offerId.toString())
  if(!offer){
    offer = new Offer(event.params.offerer.toString()+event.params.offerId.toString());
  }
  offer.valid = false;
}

export function handleOfferRefunded(event: OfferRefunded): void {
  let offer = Offer.load(event.params.offerer.toString()+event.params.offerId.toString())
  if(!offer){
    offer = new Offer(event.params.offerer.toString()+event.params.offerId.toString());
  }
  offer.valid = false;
}
