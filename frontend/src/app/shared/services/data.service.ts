import { Injectable } from '@angular/core'

export interface Investment {
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
  subInvestments: Investment[]
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private fakeInvestments: Investment[] = [
    {
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 10000,
      bonus: 0.1,
    },
    {
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 5000,
      bonus: 0.1,
    },
    {
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 2000,
      bonus: 0.1,
    },
    {
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 100000,
      bonus: 0.1,
    },
    {
      risk: 'Pandemie',
      month: 4,
      year: 2020,
      sum: 50000,
      bonus: 0.12,
    },
    {
      risk: 'Pandemie',
      month: 5,
      year: 2020,
      sum: 70000,
      bonus: 0.09,
    },
    {
      risk: 'Pandemie',
      month: 5,
      year: 2020,
      sum: 5500,
      bonus: 0.09,
    },
    {
      risk: 'Pandemie',
      month: 5,
      year: 2020,
      sum: 90000,
      bonus: 0.12,
    },
    {
      risk: 'Apocalypse',
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18,
    },
    {
      risk: 'Pandemie',
      month: 6,
      year: 2020,
      sum: 210000,
      bonus: 0.18,
    },
  ]

  constructor() {}

  private get investments(): Investment[] {
    return [...this.fakeInvestments]
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
    console.log('calculated Investment:', calcInvestment)
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
}
