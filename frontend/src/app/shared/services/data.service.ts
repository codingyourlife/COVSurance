import { Injectable, Inject } from '@angular/core'
import { Moment } from 'moment'
import { WEB3 } from './web3'
import Web3 from 'web3'
import * as web3Util from 'web3-utils'
import * as moment from 'moment'
import { HttpClient } from '@angular/common/http'

const artifacts = {
  MoneyVaultFactory: '0x31B0161f0aFDc28fd0A7831Db7263940C64E634f',
  TokenFactory: '0x9D8cB9a3C7390DF0A31C21e1B52E315950936Dbf',
  InsuranceFactory: '0xC8d26380Fd87423d74bAa947A25940ef6Bf9f876',
}

export interface Investment {
  id: number
  risk: string
  month: number
  year: number
  sum: number
  bonus: number
}

interface BlockChainInvestment {
  risk: string
  startSecond: number
  endSecond: number
  volume: number
  bonus: number
  validUntilSecond: number
}

export interface CaluclatedInvestment {
  possible: boolean
  totalBonus: number
  averageBonusPercent: number
  subInvestments: Investment[]
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  static lastId = 9
  private fakeInvestments: Investment[] = [
    {
      id: 0,
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 10000,
      bonus: 0.1,
    },
    {
      id: 1,
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 5000,
      bonus: 0.1,
    },
    {
      id: 2,
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 2000,
      bonus: 0.1,
    },
    {
      id: 3,
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 100000,
      bonus: 0.1,
    },
    {
      id: 4,
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 50000,
      bonus: 0.12,
    },
    {
      id: 5,
      risk: 'Pandemie',
      month: 5,
      year: 2020,
      sum: 70000,
      bonus: 0.09,
    },
    {
      id: 6,
      risk: 'Pandemie',
      month: 5,
      year: 2020,
      sum: 5500,
      bonus: 0.09,
    },
    {
      id: 7,
      risk: 'Pandemie',
      month: 5,
      year: 2020,
      sum: 90000,
      bonus: 0.12,
    },
    {
      id: 8,
      risk: 'Apocalypse',
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18,
    },
    {
      id: 9,
      risk: 'Pandemie',
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18,
    },
  ]

  private _myInvestments: Investment[] = []
  private _myInsurances: CaluclatedInvestment[] = []

  private myAcc: string

  constructor(@Inject(WEB3) private web3: Web3, private http: HttpClient) {
    this.init().catch(err => console.error(err))
  }

  async init() {
    const accounts = await this.web3.eth.getAccounts()
    this.myAcc = accounts[0]
  }

  private get investments(): Investment[] {
    return [...this.fakeInvestments]
  }

  public get myInvestments(): Investment[] {
    return this._myInvestments
  }

  public get myInsurances(): CaluclatedInvestment[] {
    return this._myInsurances
  }

  public calculateInvestment(
    risk: string,
    month: number,
    year: number,
    sum: number,
  ): CaluclatedInvestment {
    const filteredInvestments = this.comulatedInvestments
      .filter(
        invest =>
          invest.risk === risk &&
          invest.month === month &&
          invest.year === year,
      )
      .sort((invest1, invest2) => invest1.bonus - invest2.bonus)
    let restSum = sum
    let index = 0
    const calcInvestment: CaluclatedInvestment = {
      averageBonusPercent: 0,
      possible: false,
      subInvestments: [],
      totalBonus: 0,
    }
    console.log('filteredInvestments: ', filteredInvestments)
    while (restSum > 0 && index < filteredInvestments.length) {
      if (restSum > filteredInvestments[index].sum) {
        calcInvestment.subInvestments.push({ ...filteredInvestments[index] })
        calcInvestment.totalBonus +=
          filteredInvestments[index].sum * filteredInvestments[index].bonus
        restSum -= filteredInvestments[index].sum
        const dataIndex = this.fakeInvestments.findIndex(
          invest => invest.id === filteredInvestments[index].id,
        )
        if (dataIndex !== -1) {
          this.fakeInvestments.splice(dataIndex, 1)
        }
      } else {
        calcInvestment.subInvestments.push({
          ...filteredInvestments[index],
          sum: restSum,
        })
        calcInvestment.totalBonus += restSum * filteredInvestments[index].bonus

        const dataIndex = this.fakeInvestments.findIndex(
          invest => invest.id === filteredInvestments[index].id,
        )
        if (dataIndex !== -1) {
          this.fakeInvestments[dataIndex].sum -= restSum
        }

        restSum = 0
      }
      index++
    }
    if (restSum === 0) {
      calcInvestment.possible = true
    }
    calcInvestment.averageBonusPercent = calcInvestment.totalBonus / sum
    console.log('calculated Investment:', calcInvestment)
    this.myInsurances.push({ ...calcInvestment })
    return calcInvestment
  }

  public get comulatedInvestments(): Investment[] {
    const investments = this.investments
    const comulatedInvestment: Investment[] = []
    for (const investment of investments) {
      const index = comulatedInvestment.findIndex(
        invest =>
          invest.year === investment.year &&
          invest.risk === investment.risk &&
          invest.month === investment.month &&
          invest.bonus === investment.bonus,
      )
      if (index !== -1) {
        comulatedInvestment[index].sum += investment.sum
      } else {
        comulatedInvestment.push({ ...investment })
      }
    }
    return comulatedInvestment
  }

  public async invest(
    risk: string,
    volume: number,
    bonus: number,
    month: number,
    year: number,
    validUntil: Moment,
  ) {
    const investment: Investment = {
      id: ++DataService.lastId,
      risk,
      bonus,
      month,
      year,
      sum: volume,
    }
    this.fakeInvestments.push(investment)
    this.myInvestments.push({ ...investment })
    const blockChainInvestment: BlockChainInvestment = {
      risk,
      bonus, // 0.1
      volume,
      startSecond: Math.floor(new Date(year, month, 0).getTime() / 1000),
      endSecond: Math.floor(new Date(year, month, 31).getTime() / 1000),
      validUntilSecond: Math.floor(validUntil.valueOf() / 1000),
    }
    console.log(blockChainInvestment)
    const locator = await this.http
      .get('../../../assets/artifacts/Locator.json')
      .toPromise()
      .then(res => res as any)
    const InsuranceFactoryAbi = await this.http
      .get('../../../assets/artifacts/InsuranceFactory.abi.json')
      .toPromise()
      .then(res => res as any)
    const contract = new this.web3.eth.Contract(
      InsuranceFactoryAbi,
      locator.InsuranceFactory,
      {
        from: this.myAcc,
      },
    )
    console.log(contract)
    const tokenNameInvest = `${risk} investor ${bonus * 100}`
    const tokenNameInsuree = `${risk} insuree ${bonus * 100}`
    const rateInPercent = this.web3.utils.toWei(bonus + '', 'ether')

    const res = await contract.methods
      .createInsuranceFor(
        tokenNameInvest,
        tokenNameInsuree,
        blockChainInvestment.startSecond.toString(),
        blockChainInvestment.endSecond.toString(),
        Math.floor(Date.now() / 1000).toString(),
        blockChainInvestment.validUntilSecond.toString(),
        rateInPercent,
      )
      .send()
    console.log(res)
    const blocknumber = await this.web3.eth.getBlockNumber()
    console.log(
      contract.getPastEvents('allEvents', {
        fromBlock: 17405256 - 1000,
        toBlock: blocknumber,
      }),
    )
  }
}
