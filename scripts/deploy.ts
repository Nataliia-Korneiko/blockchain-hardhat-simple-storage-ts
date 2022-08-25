import { ethers, run, network } from 'hardhat';

const { ETHERSCAN_API_KEY } = process.env;

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory('SimpleStorage');
  console.log('Deploying contract...');

  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);

  // console.log(network.config);
  // 4 - rinkeby chainId
  if (network.config.chainId === 4 && ETHERSCAN_API_KEY) {
    console.log('Waiting for block confirmations...');

    await simpleStorage.deployTransaction.wait(6); // 6 blocs
    await verify(simpleStorage.address, []); // simpleStorage.address - contractAddress, [] - args
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is: ${currentValue}`);

  // Update the current value
  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait(1);

  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is: ${updatedValue}`);
}

async function verify(contractAddress: string, args: any[]) {
  console.log('Verifying contract...');

  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes('already verified')) {
      console.log('Already Verified!');
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
