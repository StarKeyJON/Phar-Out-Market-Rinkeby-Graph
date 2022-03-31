import { Address, BigInt, DataSourceContext } from "@graphprotocol/graph-ts"
import {
  MarketTrades,
  BlindTradeEntered,
  TradeAccepted,
  TradeEntered,
  TradeUpdated,
  TradeWithdrawn
} from "../../generated/MarketTrades/MarketTrades"
import { ERC721 } from "../../generated/MarketTrades/ERC721"
import { ERC1155 } from "../../generated/MarketTrades/ERC1155"
import { NFT, Trade, MarketItem, Stats, User } from "../../generated/schema"
import { getDateString, getTimeString } from "../helpers/datetime"

/*
emit TradeEntered(
          false,
          itemId[i], 
          tradeId, 
          tokenId[i],
          amount1155[i],
          nftContract[i], 
          msg.sender, 
          seller[i]);
        }
*/
export function handleTradeEntered(event: TradeEntered): void {
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);

  let stats = Stats.load("trade_stats");

  if(!stats){
    stats = new Stats("trade_stats");
    stats.type = "trades"
    stats.count = BigInt.fromI32(0);
  }
  stats.count = stats.count + BigInt.fromI32(1);


  let user = User.load(event.params.trader.toString());
  if(!user){
    let user_stats = Stats.load("user_stats");
    if(!user_stats){
      user_stats = new Stats("user_stats");
      user_stats.count = BigInt.fromI32(0);
    }
    user = new User(event.params.trader.toString());
    user_stats.count = user_stats.count + BigInt.fromI32(1);
    user_stats.type = "users";
    user.block = event.block.timestamp;
    user.date = date;
  }
  user.save();


  let trade = Trade.load(event.params.trader.toString()+event.params.tradeId.toString());

  if (!trade) {
    trade = new Trade(event.params.trader.toString()+event.params.tradeId.toString());
  }
  
  trade.type = "listed";
  trade.date = date;
  trade.block = event.block.timestamp;
  trade.item = event.params.seller.toString() + event.params.itemId.toString();

  let marketItem = MarketItem.load(event.params.trader.toString() + event.params.itemId.toString());
  if(!marketItem){
    marketItem = new MarketItem(event.params.trader.toString() + event.params.itemId.toString());
  }
  marketItem.block = event.block.timestamp;
  marketItem.date = date;
  marketItem.itemId = event.params.itemId;
  marketItem.active = true;
  marketItem.amount1155 = event.params.amount1155;

  marketItem.save();

  let nft = NFT.load(event.params.nftCont.toString() + event.params.tokenId.toString());
  if(!nft){
    nft = new NFT(event.params.nftCont.toString() + event.params.tokenId.toString());
  }
  nft.token_address = event.params.nftCont;
  nft.token_id = event.params.tokenId;
  nft.owner_of = event.params.seller;
  if(event.params.amount1155 > BigInt.fromI32(0)){
    nft.contract_type = "ERC1155";
  }

  nft.save();

  trade.valid = true;
  trade.tradeId = event.params.tradeId;
  trade.trader = event.params.trader.toString();
  trade.isSpecific = true;

  trade.save()
}


/*
emit BlindTradeEntered(
          is1155[i],
          isSpecific[i],
          wantedId[i],
          tradeId, 
          tokenId[i],
          amount1155[i],
          nftContract[i], 
          wantContract[i],
          msg.sender);
      }
*/
export function handleBlindTradeEntered(event: BlindTradeEntered): void {
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);

  let stats = Stats.load(event.address.toString()+"_blind");

  if(!stats){
    stats = new Stats(event.address.toString()+"_blind");
  }
  stats.count = stats.count + BigInt.fromI32(1);

  let trade = Trade.load(event.params.trader.toString()+event.params.tradeId.toString());

  if (!trade) {
    trade = new Trade(event.params.trader.toString()+event.params.tradeId.toString());
  }
  
  trade.type = "blind";
  trade.date = date;
  trade.block = event.block.timestamp;

  let marketItem = MarketItem.load(event.params.trader.toString() + event.params.tradeId.toString());
  if(!marketItem){
    marketItem = new MarketItem(event.params.trader.toString() + event.params.tradeId.toString());
  }
  marketItem.block = event.block.timestamp;
  marketItem.date = date;
  marketItem.itemId = event.params.tradeId;
  marketItem.active = true;
  marketItem.amount1155 = event.params.amount1155;

  marketItem.save();

  let nft = NFT.load(event.params.nftCont.toString() + event.params.tokenId.toString());
  if(!nft){
    nft = new NFT(event.params.nftCont.toString() + event.params.tokenId.toString());
  }
  nft.token_address = event.params.nftCont;
  nft.token_id = event.params.tokenId;
  nft.owner_of = event.params.trader;
  if(event.params.amount1155 > BigInt.fromI32(0)){
    nft.contract_type = "ERC1155";
  }

  nft.save();
  
  trade.type = "blind";
  trade.block = event.block.timestamp;
  trade.date = date;

  trade.item = event.params.trader.toString() + event.params.tradeId.toString();

  trade.valid = true;
  trade.trader = event.params.trader.toString();
  trade.tradeId = event.params.tradeId;
  trade.isSpecific = event.params.isSpecific;

  trade.save()

}

export function handleTradeAccepted(event: TradeAccepted): void {

  let trade = Trade.load(event.params.trader.toString() + event.params.tradeId.toString());
  if(trade){
    trade.valid = false;
  }
}

export function handleTradeUpdated(event: TradeUpdated): void {
  let trade = Trade.load(event.params.trader.toString() + event.params.tradeId.toString());
  if(trade){
    trade.valid = false;
  }
}

export function handleTradeWithdrawn(event: TradeWithdrawn): void {
  let trade = Trade.load(event.params.trader.toString() + event.params.tradeId.toString());
  if(trade){
    trade.valid = false;
  }
}
