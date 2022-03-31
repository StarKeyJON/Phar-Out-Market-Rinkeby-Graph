import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  nftClaimed
} from "../../generated/Mint/Mint"
import { NFT, Metadata, MintEvent } from "../../generated/schema"
import { getDateString, getTimeString } from "../helpers/datetime";
import { ERC721 } from "../../generated/Mint/ERC721";
import { PhamNFTs } from "../../generated/Mint/PhamNFTs";
// import MintContract from "../../generated/Mint/Mint";

export function handlenftClaimed(event: nftClaimed): void {

  let mint = MintEvent.load(event.transaction.from.toHexString());
  if (!mint) {
    mint = new MintEvent(event.transaction.from.toHexString())
  }
  let date = getTimeString(event.block.timestamp) + " : " + getDateString(event.block.timestamp);
  mint.date = date;
  mint.block = event.block.timestamp;
  mint.minter = event.params.creator.toString();
  mint.nftId = event.params.nftId;
  mint.value = event.transaction.value;
  let nftContract = PhamNFTs.bind(Address.fromString("0x7D19ee7b025874009A77a20FdC244DCe005d6c07"));

  let nft = NFT.load("0x7D19ee7b025874009A77a20FdC244DCe005d6c07" + event.params.nftId.toString());
  if(!nft){
    nft = new NFT("0x7D19ee7b025874009A77a20FdC244DCe005d6c07" + event.params.nftId.toString());
  }
  nft.contract_type = "ERC721";
  nft.token_address = nftContract._address;
  nft.token_id = event.params.nftId;
  nft.owner_of = event.params.creator;
  
  let metadata = Metadata.load("0x7D19ee7b025874009A77a20FdC244DCe005d6c07"+event.params.nftId.toString());
  if(!metadata){
    metadata = new Metadata("0x7D19ee7b025874009A77a20FdC244DCe005d6c07"+event.params.nftId.toString());
  }
  metadata.type = "ERC721";
  let uri = nftContract.try_tokenURI(event.params.nftId);
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
  metadata.nft = nft.id;

  metadata.save();  
  mint.save();
  nft.save();
}