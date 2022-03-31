import { BigInt } from "@graphprotocol/graph-ts"
import {
  ItemBought,
  ItemDelisted,
  ItemListed,
  ItemUpdated
} from "../generated/NFTMarket/NFTMarket"
import { Stats, User, MarketItem, NFT, Swap, Metadata } from "../generated/schema"
import { ERC721 } from "../generated/NFTMarket/ERC721";
import { ERC1155 } from "../generated/NFTMarket/ERC1155";
import { getDateString, getTimeString } from './helpers/datetime';

export function handleItemListed(event: ItemListed): void {

  let listing_stats = Stats.load("listing_stats");
  
  if(!listing_stats){
    listing_stats = new Stats("listing_stats");
    listing_stats.count = BigInt.fromI32(0);
    listing_stats.type = "listings";
  }
  // BigInt and BigDecimal math are supported
  listing_stats.count = listing_stats.count + BigInt.fromI32(1);

  let user_stats = Stats.load("user_stats");
  
  if(!user_stats){
    user_stats = new Stats("user_stats");
    user_stats.count = BigInt.fromI32(0);
  }
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);

  let user = User.load(event.params.seller.toString());

  if(!user){
    user = new User(event.params.seller.toString());
    user_stats.count = user_stats.count + BigInt.fromI32(1);
    user_stats.type = "users";
    user.block = event.block.timestamp;
    user.date = date;
  }
  user.save();

  let marketItem = new MarketItem(event.transaction.from.toString() + event.params.itemId.toString())
  marketItem.block = event.block.timestamp;
  marketItem.date = date;
  marketItem.itemId = event.params.itemId;
  marketItem.active = true;
  marketItem.amount1155 = event.params.amount1155;
  marketItem.price = event.params.price;

  marketItem.save();

  let nft = NFT.load(event.params.nftContract.toString() + event.params.tokenId.toString());
  if(!nft){
    nft = new NFT(event.params.nftContract.toString() + event.params.tokenId.toString());
  }
  nft.token_address = event.params.nftContract;
  nft.token_id = event.params.tokenId;
  nft.owner_of = event.params.seller;
  if(event.params.amount1155 > BigInt.fromI32(0)){
    nft.contract_type = "ERC1155";
  }

  nft.save();

  if(event.params.amount1155 > BigInt.fromI32(0)){
    let nftContract = ERC1155.bind(event.params.nftContract);
    let metadata = Metadata.load(event.params.nftContract.toString()+event.params.tokenId.toString());
    if(!metadata){
      metadata = new Metadata(event.params.nftContract.toString()+event.params.tokenId.toString());
    }
    metadata.type = "ERC1155";
    let uri = nftContract.try_uri(event.params.tokenId)
    if(!uri.reverted){
      metadata.uri = uri.value;
    }
    metadata.save();
  } else {
    let nftContract = ERC721.bind(event.params.nftContract);
    let metadata = Metadata.load(event.params.nftContract.toString()+event.params.tokenId.toString());
    if(!metadata){
      metadata = new Metadata(event.params.nftContract.toString()+event.params.tokenId.toString());
    }
    metadata.type = "ERC721";
    let uri = nftContract.try_tokenURI(event.params.tokenId);
    if(!uri.reverted){
      metadata.uri = uri.value;
    }
    let name = nftContract.try_name();
    if(!name.reverted){
      metadata.name = name.value;
    }
    let symbol = nftContract.try_symbol();
    if(!symbol.reverted){
      metadata.symbol = symbol.value;
    }
    metadata.save();
  }
}

export function handleItemBought(event: ItemBought): void {

  let sale_stats = Stats.load("sales_stats");
  
  if(!sale_stats){
    sale_stats = new Stats("sales_stats");
    sale_stats.count = BigInt.fromI32(0);
    sale_stats.type = "sales";
  }
  // BigInt and BigDecimal math are supported
  sale_stats.count = sale_stats.count + BigInt.fromI32(1)

  let swap = new Swap(event.transaction.hash.toHexString());
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);
  swap.date = date;
  swap.block = event.block.timestamp;
  swap.type = "listed";
  let user = User.load(event.params.fromAddress.toString());
  if (user == null) {
    user = new User(event.params.fromAddress.toString());
  }
  swap.buyer = user.id;

  let marketItem = MarketItem.load(event.params.fromAddress.toString() + event.params.nftContract.toString() + event.params.itemId.toString());
  if (marketItem == null) {
    marketItem = new MarketItem(event.params.fromAddress.toString() + event.params.nftContract.toString() + event.params.itemId.toString());
  }
  swap.item = marketItem.id;
  swap.value = event.transaction.value;
}

export function handleItemDelisted(event: ItemDelisted): void {
  let marketItem = MarketItem.load(event.transaction.from.toString() + event.params.nftContract.toString() + event.params.itemId.toString())
  if(!marketItem){marketItem = new MarketItem(event.transaction.from.toString() + event.params.nftContract.toString() + event.params.itemId.toString())
  }
  marketItem.active = false;
}

export function handleItemUpdated(event: ItemUpdated): void {
  let marketItem = MarketItem.load(event.transaction.from.toString() + event.params.nftContract.toString() + event.params.itemId.toString())
  if(!marketItem){marketItem = new MarketItem(event.transaction.from.toString() + event.params.nftContract.toString() + event.params.itemId.toString())
  }
  marketItem.price = event.params.price;
}
