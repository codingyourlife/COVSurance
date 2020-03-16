import { Injectable, Inject } from "@angular/core";
import { Moment } from "moment";
import { WEB3 } from "./web3";
import Web3 from "web3";
import * as web3Util from "web3-utils";
import * as moment from "moment";
import { HttpClient } from "@angular/common/http";

export interface Investment {
  id: number;
  risk: string;
  month: number;
  year: number;
  sum: number;
  bonus: number;
}

interface BlockChainInvestment {
  risk: string;
  startSecond: number;
  endSecond: number;
  volume: number;
  bonus: number;
  validUntilSecond: number;
}

export interface CaluclatedInvestment {
  possible: boolean;
  totalBonus: number;
  averageBonusPercent: number;
  subInvestments: Investment[];
}

@Injectable({
  providedIn: "root"
})
export class DataService {
  static lastId = 9;
  static fromBlock = (17405256 - 1000).toString();
  private fakeInvestments: Investment[] = [
    {
      id: 0,
      risk: "LOCAL DEMO",
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18
    }
  ];

  private _myInvestments: Investment[] = [];
  private _myInsurances: CaluclatedInvestment[] = [];

  private myAcc: string;
  private contract: any;
  private locator: any;

  constructor(@Inject(WEB3) private web3: Web3, private http: HttpClient) {
    this.init().catch(err => console.error(err));
  }

  getInvestmentBasisDataFromEvent(logEntry: any) {
    const tokenNameInvestor = logEntry.returnValues["tokenNameInvestor"];
    const tokenNameInsuree = logEntry.returnValues["tokenNameInsuree"];
    const insurancePeriodStart = logEntry.returnValues["insurancePeriodStart"];
    const insurancePeriodEnd = logEntry.returnValues["insurancePeriodEnd"];
    const signaturePeriodStart = logEntry.returnValues["signaturePeriodStart"];
    const signaturePeriodEnd = logEntry.returnValues["signaturePeriodEnd"];
    const investorCoin = logEntry.returnValues["investorCoin"];
    const insureeCoin = logEntry.returnValues["insureeCoin"];
    const moneyVault = logEntry.returnValues["moneyVault"];
    // const rateInPercent = logEntry.returnValues["rateInPercent"]; //TODO

    const investmentBasisData = {
      risk: tokenNameInvestor.substring(0, tokenNameInvestor.length - 12),
      bonus: tokenNameInvestor.substring(
        tokenNameInvestor.length - 3,
        tokenNameInvestor.length - 1
      ), //TODO: merge rateInPercent from InsuranceCreatedDetails event if same address of investorcoin and insureeCoin
      month: new Date(insurancePeriodStart * 1000).getMonth(),
      year: new Date(insurancePeriodStart * 1000).getFullYear(),
      investorCoin: investorCoin,
      insureeCoin: insureeCoin,
      moneyVault: moneyVault
    };

    return investmentBasisData;
  }

  async init() {
    const accounts = await this.web3.eth.getAccounts();
    this.myAcc = accounts[0];

    this.locator = await this.http
      .get("../../../assets/artifacts/Locator.json")
      .toPromise()
      .then(res => res as any);
    const InsuranceFactoryAbi = await this.http
      .get("../../../assets/artifacts/InsuranceFactory.abi.json")
      .toPromise()
      .then(res => res as any);

    this.contract = new this.web3.eth.Contract(
      InsuranceFactoryAbi,
      this.locator.InsuranceFactory,
      {
        from: this.myAcc
      }
    );

    // console.log(contract);

    const allEvents = await this.contract.getPastEvents("InsuranceCreated", {
      fromBlock: DataService.fromBlock,
      toBlock: "latest"
    });

    await Promise.all(
      allEvents.map(logEntry => {
        console.log(`logEntry.returnValues:`);

        const investmentBasisData = this.getInvestmentBasisDataFromEvent(
          logEntry
        );

        console.log("investmentBasisData:");
        console.log(investmentBasisData);

        const investment: Investment = {
          id: ++DataService.lastId,
          risk: investmentBasisData.risk,
          bonus: investmentBasisData.bonus,
          month: investmentBasisData.month,
          year: investmentBasisData.year,
          sum: 0 //TODO: invest into vault
        };

        this.fakeInvestments.push(investment);
      })
    );
  }

  private get investments(): Investment[] {
    return [...this.fakeInvestments];
  }

  public get myInvestments(): Investment[] {
    return this._myInvestments;
  }

  public get myInsurances(): CaluclatedInvestment[] {
    return this._myInsurances;
  }

  public calculateInvestment(
    risk: string,
    month: number,
    year: number,
    sum: number
  ): CaluclatedInvestment {
    const filteredInvestments = this.comulatedInvestments
      .filter(
        invest =>
          invest.risk === risk && invest.month === month && invest.year === year
      )
      .sort((invest1, invest2) => invest1.bonus - invest2.bonus);
    let restSum = sum;
    let index = 0;
    const calcInvestment: CaluclatedInvestment = {
      averageBonusPercent: 0,
      possible: false,
      subInvestments: [],
      totalBonus: 0
    };
    console.log("filteredInvestments: ", filteredInvestments);
    while (restSum > 0 && index < filteredInvestments.length) {
      if (restSum > filteredInvestments[index].sum) {
        calcInvestment.subInvestments.push({ ...filteredInvestments[index] });
        calcInvestment.totalBonus +=
          filteredInvestments[index].sum * filteredInvestments[index].bonus;
        restSum -= filteredInvestments[index].sum;
        const dataIndex = this.fakeInvestments.findIndex(
          invest => invest.id === filteredInvestments[index].id
        );
        if (dataIndex !== -1) {
          this.fakeInvestments.splice(dataIndex, 1);
        }
      } else {
        calcInvestment.subInvestments.push({
          ...filteredInvestments[index],
          sum: restSum
        });
        calcInvestment.totalBonus += restSum * filteredInvestments[index].bonus;

        const dataIndex = this.fakeInvestments.findIndex(
          invest => invest.id === filteredInvestments[index].id
        );
        if (dataIndex !== -1) {
          this.fakeInvestments[dataIndex].sum -= restSum;
        }

        restSum = 0;
      }
      index++;
    }
    if (restSum === 0) {
      calcInvestment.possible = true;
    }
    calcInvestment.averageBonusPercent = calcInvestment.totalBonus / sum;
    console.log("calculated Investment:", calcInvestment);
    this.myInsurances.push({ ...calcInvestment });
    return calcInvestment;
  }

  public get comulatedInvestments(): Investment[] {
    const investments = this.investments;
    const comulatedInvestment: Investment[] = [];
    for (const investment of investments) {
      const index = comulatedInvestment.findIndex(
        invest =>
          invest.year === investment.year &&
          invest.risk === investment.risk &&
          invest.month === investment.month &&
          invest.bonus === investment.bonus
      );
      if (index !== -1) {
        comulatedInvestment[index].sum += investment.sum;
      } else {
        comulatedInvestment.push({ ...investment });
      }
    }
    return comulatedInvestment;
  }

  public async invest(
    risk: string,
    volume: number,
    bonus: number,
    month: number,
    year: number,
    validUntil: Moment
  ) {
    const blockChainInvestment: BlockChainInvestment = {
      risk,
      bonus, // 0.1
      volume,
      startSecond: Math.floor(new Date(year, month, 0).getTime() / 1000),
      endSecond: Math.floor(new Date(year, month, 31).getTime() / 1000),
      validUntilSecond: Math.floor(validUntil.valueOf() / 1000)
    };
    // console.log(blockChainInvestment);

    const tokenNameInvest = `${risk} investor ${bonus * 100}%`;
    const tokenNameInsuree = `${risk} insuree ${bonus * 100}%`;
    const rateInPercent = this.web3.utils.toWei(bonus + "", "ether");

    const res = await this.contract.methods
      .createInsuranceFor(
        tokenNameInvest,
        tokenNameInsuree,
        blockChainInvestment.startSecond.toString(),
        blockChainInvestment.endSecond.toString(),
        Math.floor(Date.now() / 1000).toString(),
        blockChainInvestment.validUntilSecond.toString(),
        rateInPercent
      )
      .send();
    console.log(res);

    const allEvents = await this.contract.getPastEvents("InsuranceCreated", {
      fromBlock: DataService.fromBlock,
      toBlock: "latest"
    });

    const currentInsuranceCreatedEvent = allEvents.pop();
    const currentInvestmentBasisData = this.getInvestmentBasisDataFromEvent(
      currentInsuranceCreatedEvent
    );
    console.log("currentInvestmentBasisData: ");
    console.log(currentInvestmentBasisData);

    const investment: Investment = {
      id: ++DataService.lastId,
      risk,
      bonus,
      month,
      year,
      sum: volume
    };

    const MoneyVaultAbi = await this.http
      .get("../../../assets/artifacts/MoneyVault.abi.json")
      .toPromise()
      .then(res => res as any);

    const moneyVaultContract = new this.web3.eth.Contract(
      MoneyVaultAbi,
      currentInvestmentBasisData.moneyVault,
      {
        from: this.myAcc
      }
    );

    await moneyVaultContract.methods.investorDeposits().send({
      from: this.myAcc,
      value: this.web3.utils.toWei((volume / 10000).toString(), "ether") //TODO: divided by 10000 just for testnet. contract multiplies by 1000.
    });

    // await moneyVaultContract.methods.insureeDeposits().send({
    //   from: this.myAcc,
    //   value: this.web3.utils.toWei(volume / 1000 + "", "ether") //TODO: divided by 1000 just for testnet. contract multiplies by 1000.
    // });

    this.myInvestments.push({ ...investment });
  }
}
