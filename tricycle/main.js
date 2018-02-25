const SHA256 = require('crypto-js/sha256');

class Transaction{
	constructor(money, asker, borrower, type){
		this.money = money;//how much money to transfer 
		this.owner = asker;//the owner of the money
		this.receiver = borrower; //the person borrowing the money
		this.type = type;//type of transaction 
	}
}

class Block{
	constructor(index, timestamp, data, previousHash = ''){
		this.index = index;
		this.timestamp = timestamp; 
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.calculateHash(); 
		this.nonce = 0; 
	}

	calculateHash() {
		//console.log("data: " + JSON.stringify(this.data)); 
		return SHA256(this.index + this.previousHash + this.timestamp + this.nonce + JSON.stringify(this.data)).toString(); 
	}

	mineBlock(difficulty){
		while(this.hash.substring(0,difficulty)!= Array(difficulty +1).join("0")){
			this.nonce++; 
			this.hash = this.calculateHash(); 
		}

		console.log("Block mined: " + this.hash); 
	}
}

class BlockChain {
	constructor(){
		this.chain = [this.createGenesisBlock()]; 
		this.difficulty = 4; 
	}

	createGenesisBlock() {
		return new Block(0, "1/2/1220", "Genesis Block", "0"); 	
	}

	getLatestBlock() {
		return this.chain[this.chain.length -1]; 
	}

	addBlock(newBlock) {
		newBlock.previousHash = this.getLatestBlock().hash; 
		newBlock.mineBlock(this.difficulty);  
		this.chain.push(newBlock); 
	}

	isChainValid(){
		for(let i = 1; i < this.chain.length; i++){
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i-1];

			if(currentBlock.hash !== currentBlock.calculateHash()){
				return false;
			}

			if(currentBlock.previousHash !== previousBlock.hash){
				return false;
			}

			return true; 
		}
	}
}



let cometCoin = new BlockChain();

console.log("Mining block 1...");
cometCoin.addBlock(new Block(1, "10/2/2106", new Transaction(40, "Joe", "Bob", "lease") ));
console.log("Mining block 2..."); 
cometCoin.addBlock(new Block(2, "10/2/2017", new Transaction(20, "Mitchell", "Al", "buy")));

//console.log("Is BlockChain valid?" + cometCoin.isChainValid()); 

//console.log(JSON.stringify(cometCoin, null, 4)); 
