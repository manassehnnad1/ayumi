import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedMockToken = await deploy("MockToken", {
    from: deployer,
    log: true,
  });

  console.log(`MockToken contract deployed at: `, deployedMockToken.address);
  console.log(`Token Name: Ayumi Test USDC`);
  console.log(`Token Symbol: ayUSDC`);
  console.log(`Users can claim up to 10,000 tokens per hour`);
};

export default func;
func.id = "deploy_mockToken";
func.tags = ["MockToken"];