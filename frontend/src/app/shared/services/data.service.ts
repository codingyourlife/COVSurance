import { Injectable } from '@angular/core'
import { Moment } from 'moment'
import * as moment from 'moment'

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

  constructor() {}

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

  public invest(
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
      bonus,
      volume,
      startSecond: new Date(year, month, 0).getTime() / 1000,
      endSecond: new Date(year, month, 31).getTime() / 1000,
      validUntilSecond: validUntil.valueOf() / 1000,
    }
    console.log(blockChainInvestment)
  }
}