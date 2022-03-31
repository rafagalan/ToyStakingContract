import { FakeContract, smock } from '@defi-wonderland/smock';
import '@nomiclabs/hardhat-ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai, { expect } from 'chai';
import { ethers } from 'hardhat';
import { Staking, Staking__factory, TKN } from "../../typechain";


chai.use(smock.matchers);

const l8 = (num: string) => ethers.utils.parseEther(num);

describe('Staking: Stake functionality', function () {
    let staking: Staking;
    let token: FakeContract<TKN>;

    let bob: SignerWithAddress;
    let alice: SignerWithAddress;

    beforeEach(async function () {
        [bob, alice] = await ethers.getSigners();

        token = await smock.fake<TKN>('TKN');

        const Staking = await ethers.getContractFactory('Staking', bob) as Staking__factory;
        staking = await Staking.deploy(token.address);
        await staking.deployed();
    });

    describe('stake()', function () {

        it('Should call token.transferFrom', async function () {
            await staking.stake(l8("10"));

            expect(token.transferFrom)
                .to.have.been.calledWith(bob.address, staking.address, l8("10"));
        });

        it('Should increase totalStaked', async function () {
            await staking.stake(l8("10"));

            expect(await staking.totalStaked())
                .to.be.equal(l8("10"));
        });
    });

    describe('distribute()', function () {

        it('Should revert when totalStaked < 0', async function () {
            expect(staking.distribute(l8("10")))
                .to.be.revertedWith("Staking: No tokens staked");
        });

        it('Should revert when caller is not the owner', async function () {
            await staking.stake(l8("10"));

            expect(staking.connect(alice).distribute(l8("10")))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe('unstake()', function () {

        it('Should decrease totalStaked', async function () {
            await staking.stake(l8("10"));
            await staking.unstake(l8("10"));

            expect(await staking.totalStaked())
                .to.be.equal(l8("0"));
        });

        it('Should call stakingToken.transfer with staked amount', async function () {
            await staking.stake(l8("10"));
            await staking.unstake(l8("10"));

            expect(token.transfer)
                .to.have.been.calledWith(bob.address, l8("10"));
        });

        it('Should call stakingToken.mint with reward', async function () {
            await staking.stake(l8("10"));
            await staking.distribute(l8("1"));
            await staking.unstake(l8("10"));

            expect(token.mint)
                .to.have.been.calledWith(bob.address, l8("1"));
        });

        it('Should call stakingToken.mint with reward', async function () {
            await staking.stake(l8("10"));
            await staking.connect(alice).stake(l8("10"));
            await staking.distribute(l8("1"));
            await staking.unstake(l8("10"));

            expect(token.mint)
                .to.have.been.calledWith(bob.address, l8("0.5"));
        });

        it('Should call stakingToken.mint with reward when not unstaking all stake', async function () {
            await staking.stake(l8("10"));
            await staking.connect(alice).stake(l8("10"));
            await staking.distribute(l8("1"));
            await staking.unstake(l8("5"));
            await staking.distribute(l8("1"));
            await staking.unstake(l8("5"));

            expect(token.mint)
                .to.have.been.calledTwice;
            expect(token.mint)
                .to.have.been.calledWith(bob.address, l8("0.5"));
        });
    });
});

