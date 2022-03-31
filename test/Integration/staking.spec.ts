import '@nomiclabs/hardhat-ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { solidity } from 'ethereum-waffle';
import { ethers } from 'hardhat';
import { Staking, Staking__factory, TKN, TKN__factory } from "../../typechain";

const l8 = (num: string) => ethers.utils.parseEther(num);

describe('Staking: Stake functionality', function () {
    let Token: TKN__factory;
    let Staking: Staking__factory;

    let staking: Staking;
    let token: TKN;

    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    beforeEach(async function () {
        [bob, alice] = await ethers.getSigners();

        Token = await ethers.getContractFactory('TKN', bob) as TKN__factory;
        token = await Token.deploy();
        await token.deployed();

        Staking = await ethers.getContractFactory('Staking', bob) as Staking__factory;
        staking = await Staking.deploy(token.address);
        await staking.deployed();

        await token.mint(bob.address, l8("10"));
        await token.mint(alice.address, l8("10"));
        await token.transferOwnership(staking.address);
    });

    describe('stake()', function () {

        it('Should transfer tokens', async function () {
            await token.approve(staking.address, l8("10"));

            expect(() => staking.stake(l8("10")))
                .to.changeTokenBalance(token, staking, l8("10"))
        });

    });

    describe('unstake()', function () {

        it('Should revert if staking contract is not owner of TKN', async function () {
            const token = await Token.deploy();
            await token.deployed();

            staking = await Staking.deploy(token.address);
            await staking.deployed();

            await token.mint(bob.address, l8("10"));
            await token.approve(staking.address, l8("10"));
            await staking.stake(l8("10"))
            await staking.distribute(l8("10"));

            expect(staking.unstake(l8("10")))
                .to.be.revertedWith("Ownable: caller is not the owner")
        });
    });
});

