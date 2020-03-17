import { Injectable, Inject } from '@angular/core'
import { Moment } from 'moment'
import { WEB3 } from './web3'
import Web3 from 'web3'
import { HttpClient } from '@angular/common/http'
import { ContractsService, BlockChainInvestment } from './contracts.service'
import { runInThisContext } from 'vm'

export interface Investment {
  id: string
  risk: string
  month: number
  year: number
  sum: number
  bonus: number
}

export interface CaluclatedInvestment {
  possible: boolean
  totalBonus: number
  averageBonusPercent: number
  culminatedSubInvestments: Investment[]
  subInvestments: Investment[]
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private cachedInvestments: Investment[] = []

  private dummyData: Investment[] = [
    {
      id: '0',
      risk: 'CoV-Betriebsunterbrechung',
      month: 4,
      year: 2020,
      sum: 10000,
      bonus: 0.1,
    },
    {
      id: '1',
      risk: 'CoV-Betriebsunterbrechung',
      month: 4,
      year: 2020,
      sum: 5000,
      bonus: 0.1,
    },
    {
      id: '2',
      risk: 'CoV-Veranstaltungsausfall',
      month: 4,
      year: 2020,
      sum: 2000,
      bonus: 0.1,
    },
    {
      id: '3',
      risk: 'CoV-Betriebsunterbrechung',
      month: 4,
      year: 2020,
      sum: 100000,
      bonus: 0.1,
    },
    {
      id: '4',
      risk: 'CoV-Betriebsunterbrechung',
      month: 4,
      year: 2020,
      sum: 50000,
      bonus: 0.12,
    },
    {
      id: '5',
      risk: 'CoV-Betriebsunterbrechung',
      month: 5,
      year: 2020,
      sum: 70000,
      bonus: 0.09,
    },
    {
      id: '6',
      risk: 'CoV-Veranstaltungsausfall',
      month: 5,
      year: 2020,
      sum: 5500,
      bonus: 0.09,
    },
    {
      id: '7',
      risk: 'CoV-Betriebsunterbrechung',
      month: 5,
      year: 2020,
      sum: 90000,
      bonus: 0.12,
    },
    {
      id: '8',
      risk: 'CoV-Betriebsunterbrechung',
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18,
    },
    {
      id: '9',
      risk: 'CoV-Veranstaltungsausfall',
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18,
    },
  ]

  private lastInsurancePull = 0

  private _myInvestments: Investment[] = []
  private lastMyInvestmentsPull = 0
  private _myInsurances: Investment[] = []
  private lastMyInsurancesPull = 0

  private contractsUnavailable: boolean

  constructor(private contracts: ContractsService) {
    this.init().catch(err => console.error(err))
  }

  async hasAccessToBlockchain(): Promise<boolean> {
    await this.contracts.ready
    return this.contracts.hasEtheriumAccess()
  }

  async init() {
    this.contracts.ready
      .then(ready => {
        if (ready) {
          return this.contracts.getInsuranceData()
        }
      })
      .then(insuranceData => {
        if (!insuranceData) {
          this.contractsUnavailable = true
        }
        console.log('insuranceData: ', insuranceData)
      })
  }

  async fetchBlockchainData() {
    await this.contracts.ready
    const [
      investments,
      rawInvestments,
    ] = await this.contracts.getInsuranceData()
    this.cachedInvestments = investments.filter(invest => invest.sum > 0)
    this.lastInsurancePull = Date.now()
  }

  async fetchMyInvestments() {
    await this.contracts.ready
    const investments = await this.contracts.getMyInvestments()
    this._myInvestments = investments.filter(invest => invest.sum > 0)
    this.lastMyInvestmentsPull = Date.now()
  }

  async fetchMyInsurances() {
    await this.contracts.ready
    const investments = await this.contracts.getMyInsurances()
    this._myInsurances = investments.filter(invest => invest.sum > 0)
    this.lastMyInsurancesPull = Date.now()
  }

  private get investments(): Promise<Investment[]> {
    if (this.contractsUnavailable) {
      return Promise.resolve([...this.dummyData])
    }
    if (this.lastInsurancePull < Date.now() - 10000) {
      return this.fetchBlockchainData().then(() => [...this.cachedInvestments])
    }
    return Promise.resolve([...this.cachedInvestments])
  }

  public get myInvestments(): Promise<Investment[]> {
    if (this.contractsUnavailable) {
      return Promise.resolve([])
    }
    if (this.lastMyInvestmentsPull < Date.now() - 10000) {
      return this.fetchMyInvestments().then(() => [...this._myInvestments])
    }
    return Promise.resolve([...this._myInvestments])
  }

  public get myInsurances(): Promise<Investment[]> {
    if (this.contractsUnavailable) {
      return Promise.resolve([])
    }
    if (this.lastMyInsurancesPull < Date.now() - 10000) {
      return this.fetchMyInsurances().then(() => [...this._myInsurances])
    }
    return Promise.resolve([...this._myInsurances])
  }

  public async commitInsurance(calcInvestment: CaluclatedInvestment) {
    const blockChainInsurance: BlockChainInvestment[] = calcInvestment.subInvestments.map(
      subInvest => {
        return {
          risk: subInvest.risk,
          bonus: subInvest.bonus, // 0.1
          volume: subInvest.sum,
          startSecond: Math.floor(
            new Date(subInvest.year, subInvest.month, 1).getTime() / 1000,
          ),
          endSecond: Math.floor(
            new Date(subInvest.year, subInvest.month + 1, 0).getTime() / 1000,
          ),
        }
      },
    )
    return this.contracts.commitBlockChainInsurance(blockChainInsurance)
  }

  public async calculateInvestment(
    risk: string,
    month: number,
    year: number,
    sum: number,
  ): Promise<CaluclatedInvestment> {
    const investments = await this.investments
    const filteredInvestments = investments
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
      culminatedSubInvestments: [],
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
      } else {
        calcInvestment.subInvestments.push({
          ...filteredInvestments[index],
          sum: restSum,
        })
        calcInvestment.totalBonus += restSum * filteredInvestments[index].bonus
        restSum = 0
      }
      index++
    }
    if (restSum === 0) {
      calcInvestment.possible = true
    }
    calcInvestment.averageBonusPercent = calcInvestment.totalBonus / sum
    calcInvestment.culminatedSubInvestments = this.comulateInvestments(
      calcInvestment.subInvestments,
    )
    console.log('calculated Investment:', calcInvestment)
    return calcInvestment
  }

  private comulateInvestments(investments: Investment[]): Investment[] {
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

  public get comulatedInvestments(): Promise<Investment[]> {
    return this.investments.then(investments => {
      return this.comulateInvestments(investments)
    })
  }

  public async invest(
    risk: string,
    volume: number,
    bonus: number,
    month: number,
    year: number,
    validUntil: Moment,
  ) {
    console.log('month: ', month)
    const blockChainInvestment: BlockChainInvestment = {
      risk,
      bonus, // 0.1
      volume,
      startSecond: Math.floor(new Date(year, month, 1).getTime() / 1000),
      endSecond: Math.floor(new Date(year, month + 1, 0).getTime() / 1000),
      validUntilSecond: Math.floor(validUntil.valueOf() / 1000),
    }
    // console.log(blockChainInvestment);

    return this.contracts.commitBlockChainInvestment(blockChainInvestment)

    // const investment: Investment = {
    //   id: ++DataService.lastId,
    //   risk,
    //   bonus,
    //   month,
    //   year,
    //   sum: volume,
    // }

    // this.myInvestments.push({ ...investment })
  }
}
