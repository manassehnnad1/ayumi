import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Get the deployed MockToken address
  const mockToken = await get("MockToken");
  
  // Agent address (for now, use deployer address)
  // In production, you'd use a separate agent wallet
  const agentAddress = deployer;

  const deployedPortfolioManager = await deploy("PortfolioManager", {
    from: deployer,
    args: [mockToken.address, agentAddress],
    log: true,
  });

  console.log(`PortfolioManager contract deployed at: `, deployedPortfolioManager.address);
  console.log(`Managing token: `, mockToken.address);
  console.log(`Agent address: `, agentAddress);
};

export default func;
func.id = "deploy_portfolioManager";
func.tags = ["PortfolioManager"];
func.dependencies = ["MockToken"]; 