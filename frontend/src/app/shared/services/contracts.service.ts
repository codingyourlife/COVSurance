import { Injectable, Inject } from '@angular/core'
import { WEB3 } from './web3'
import Web3 from 'web3'
import { HttpClient } from '@angular/common/http'
import { Investment, DataService } from './data.service'

interface Locator {
  MoneyVaultFactory: string
  TokenFactory: string
  InsuranceFactory: string
}

export interface BlockChainInvestment {
  risk: string
  startSecond: number
  endSecond: number
  volume: number
  bonus: number
  validUntilSecond?: number
}

interface BlockChainInsurace {
  id: string
  risk: string
  bonus: number
  month: number
  year: number
  investorCoin: string
  insureeCoin: string
  moneyVault: string
}

interface InsuranceCreatedReturnValues {
  [key: number]: string
  insurancePeriodEnd: string //"1585605600"
  insurancePeriodStart: string //"1582930800"
  insureeCoin: string //"0x79BB25b75D3Ed9bBaf412b3AEc970Cc75D99b1af"
  investorCoin: string //"0x512Dd2F7aA9e86536D0ff83dDbd1e0F31ed9dDf9"
  moneyVault: string //"0xB76489CEA7e4b93E094E90408D4f22d66d40aCdB"
  sender: string //"0x4797Ee09e6A9632dc0aDe35B4C198c377b3d22a3"
  signaturePeriodEnd: string //"1584399600"
  signaturePeriodStart: string //"1584332920"
  tokenNameInsuree: string //"CoV-Betriebsunterbrechung insuree 11%"
  tokenNameInvestor: string //"CoV-Betriebsunterbrechung investor 11%"
}

interface DepositedByInvestorReturnValues {
  [key: number]: string
  amount: string // amount in wei 2^18
  payee: string // address of investor
}

interface BlockchainEvent<T> {
  address: string //"0xeB8c5f7b5acA4177A1710Acc6bF8DdA2D57d435b"
  blockHash: string //"0xdfe43482014a141fa6aad9795dee4ffa5fdddddb984deac5168f766a90bcddc4"
  blockNumber: number //17409538
  event: string //"InsuranceCreated"
  id: string //"log_1a0d9c24"
  logIndex: number //17
  raw: {
    data: string // binary data in hexadecimal
    topics: string[] // array of binary addresses
  }
  removed: boolean //false
  returnValues: T
  signature: string //"0x06e81de87ffe625e9117edfc144f1a64701afd077f3e9b7e9a9941912d4efa5f"
  transactionHash: string //"0x4b29225c788c73af7102f7acc4e386ab81ecd18326da1b8070b41aff96a91583"
  transactionIndex: number //0
  transactionLogIndex: string //"0x11"
  type: string //"mined"
}

type InsuranceCreatedEvent = BlockchainEvent<InsuranceCreatedReturnValues> // eventnames: InsuranceCreated, InsuranceCreatedDetails
type DepoistedByInvestorEvent = BlockchainEvent<DepositedByInvestorReturnValues> // eventname: StateChangedToInvestorFound, DepositedByInvestor

const TEST_MULTIPLIER = 10000

@Injectable({
  providedIn: 'root',
})
export class ContractsService {
  static fromBlock = (17405256 - 1000).toString()
  private myAcc: string
  private locator: Locator

  private insuranceFactoryABI: any
  private moneyVaultABI: any
  private insureeCoinABI: any
  private investorCoinABI: any

  private investContract: any
  private moneyVaultContract: any
  private insureeCoinContract: any
  private investorCoinContract: any

  public ready: Promise<boolean>

  constructor(@Inject(WEB3) private web3: Web3, private http: HttpClient) {
    this.ready = new Promise((resolve, reject) => {
      this.init()
        .then(() => resolve(true))
        .catch(err => {
          resolve(false)
          console.error(err)
        })
    })
  }

  private getFiles() {
    return Promise.all([
      this.http
        .get('../../../assets/artifacts/Locator.json')
        .toPromise()
        .then(res => (this.locator = res as Locator)),
      this.http
        .get('../../../assets/artifacts/InsuranceFactory.abi.json')
        .toPromise()
        .then(res => (this.insuranceFactoryABI = res as any)),
      this.http
        .get('../../../assets/artifacts/MoneyVault.abi.json')
        .toPromise()
        .then(res => (this.moneyVaultABI = res as any)),
      this.http
        .get('../../../assets/artifacts/InsureeCoin.abi.json')
        .toPromise()
        .then(res => (this.insureeCoinABI = res as any)),
      this.http
        .get('../../../assets/artifacts/InvestorCoin.abi.json')
        .toPromise()
        .then(res => (this.investorCoinABI = res as any)),
    ])
  }

  private getInvestmentBasisDataFromEvent(
    logEntry: InsuranceCreatedEvent,
  ): BlockChainInsurace {
    const tokenNameInvestor = logEntry.returnValues['tokenNameInvestor']
    const tokenNameInsuree = logEntry.returnValues['tokenNameInsuree']
    const insurancePeriodStart = Number(
      logEntry.returnValues['insurancePeriodStart'],
    )
    const insurancePeriodEnd = Number(
      logEntry.returnValues['insurancePeriodEnd'],
    )
    const signaturePeriodStart = Number(
      logEntry.returnValues['signaturePeriodStart'],
    )
    const signaturePeriodEnd = Number(
      logEntry.returnValues['signaturePeriodEnd'],
    )
    const investorCoin = logEntry.returnValues['investorCoin']
    const insureeCoin = logEntry.returnValues['insureeCoin']
    const moneyVault = logEntry.returnValues['moneyVault']
    console.log('logEntry: ', logEntry)
    // const rateInPercent = logEntry.returnValues["rateInPercent"]; //TODO

    const bonus = tokenNameInvestor.split(' ')[2]

    const investmentBasisData = {
      id: logEntry.id,
      risk: tokenNameInvestor.split(' ')[0],
      bonus: Number(bonus.substring(0, bonus.length - 1)) / 100,
      month: new Date(insurancePeriodStart * 1000).getMonth(),
      year: new Date(insurancePeriodStart * 1000).getFullYear(),
      investorCoin: investorCoin,
      insureeCoin: insureeCoin,
      moneyVault: moneyVault,
    }

    return investmentBasisData
  }

  private async mapInsuranceEventToData(
    insurance: BlockChainInsurace,
  ): Promise<Investment> {
    const insureeCoin = this.getInsureeCoin(insurance.insureeCoin)
    const investorCoin = this.getInvestorCoin(insurance.investorCoin)
    const [insureeDepositStr, investorDepositStr] = await Promise.all([
      insureeCoin.methods.totalSupply().call(),
      investorCoin.methods.totalSupply().call(),
    ])
    const insureeDeposit =
      Number(this.web3.utils.fromWei(insureeDepositStr, 'ether')) *
      (TEST_MULTIPLIER / 1000)
    const investorDeposit =
      Number(this.web3.utils.fromWei(investorDepositStr, 'ether')) *
      (TEST_MULTIPLIER / 1000)
    console.log('insureeDeposit: ', insureeDeposit)
    console.log('investorDeposit: ', investorDeposit)

    const bonusInPercent = insurance.bonus

    const sum = investorDeposit - insureeDeposit / bonusInPercent

    console.log('sum: ', sum)

    return {
      id: insurance.id,
      risk: insurance.risk,
      bonus: bonusInPercent,
      month: insurance.month,
      year: insurance.year,
      sum,
    }
  }

  async getMyInsurances(): Promise<Investment[]> {
    const allInsuranceContracts: InsuranceCreatedEvent[] = await this.investContract.getPastEvents(
      'InsuranceCreated',
      {
        fromBlock: ContractsService.fromBlock,
        toBlock: 'latest',
      },
    )
    const investments: Investment[] = await Promise.all(
      allInsuranceContracts.map(logEntry => {
        console.log(`logEntry.returnValues:`)

        const investmentBasisData = this.getInvestmentBasisDataFromEvent(
          logEntry,
        )

        const moneyVault = this.getMoneyVault(investmentBasisData.moneyVault)
        return moneyVault.methods
          .depositsOfInsuree(this.myAcc)
          .call()
          .then(depositInWei => {
            console.log('depositsOfInsuree: ', depositInWei)
            return {
              id: investmentBasisData.id,
              risk: investmentBasisData.risk,
              bonus: investmentBasisData.bonus,
              month: investmentBasisData.month,
              year: investmentBasisData.year,
              sum:
                Number(this.web3.utils.fromWei(depositInWei, 'ether')) *
                TEST_MULTIPLIER,
            }
          })
      }),
    )
    return investments
  }

  async getMyInvestments(): Promise<Investment[]> {
    const allInsuranceContracts: InsuranceCreatedEvent[] = await this.investContract.getPastEvents(
      'InsuranceCreated',
      {
        fromBlock: ContractsService.fromBlock,
        toBlock: 'latest',
      },
    )
    const investments: Investment[] = await Promise.all(
      allInsuranceContracts.map(logEntry => {
        console.log(`logEntry.returnValues:`)

        const investmentBasisData = this.getInvestmentBasisDataFromEvent(
          logEntry,
        )

        const moneyVault = this.getMoneyVault(investmentBasisData.moneyVault)
        return moneyVault.methods
          .depositsOfInvestor(this.myAcc)
          .call()
          .then(depositInWei => {
            console.log('depositsOfInvestor: ', depositInWei)
            return {
              id: investmentBasisData.id,
              risk: investmentBasisData.risk,
              bonus: investmentBasisData.bonus,
              month: investmentBasisData.month,
              year: investmentBasisData.year,
              sum:
                Number(this.web3.utils.fromWei(depositInWei, 'ether')) *
                TEST_MULTIPLIER,
            }
          })
      }),
    )
    return investments
  }

  async getInsuranceData(): Promise<[Investment[], BlockChainInsurace[]]> {
    const allInsuranceContracts: InsuranceCreatedEvent[] = await this.investContract.getPastEvents(
      'InsuranceCreated',
      {
        fromBlock: ContractsService.fromBlock,
        toBlock: 'latest',
      },
    )

    const rawInsurancContracts: BlockChainInsurace[] = []

    const investments: Investment[] = await Promise.all(
      allInsuranceContracts.map(logEntry => {
        console.log(`logEntry.returnValues:`)

        const investmentBasisData = this.getInvestmentBasisDataFromEvent(
          logEntry,
        )

        rawInsurancContracts.push(investmentBasisData)

        return this.mapInsuranceEventToData(investmentBasisData)
      }),
    )

    return [investments, rawInsurancContracts]
  }

  private getMoneyVault(address: string) {
    return new this.web3.eth.Contract(this.moneyVaultABI, address, {
      from: this.myAcc,
    })
  }

  private getInvestorCoin(address: string) {
    return new this.web3.eth.Contract(this.investorCoinABI, address, {
      from: this.myAcc,
    })
  }

  private getInsureeCoin(address: string) {
    return new this.web3.eth.Contract(this.insureeCoinABI, address, {
      from: this.myAcc,
    })
  }

  private async testStuff() { }

  private getContracts() {
    this.investContract = new this.web3.eth.Contract(
      this.insuranceFactoryABI,
      this.locator.InsuranceFactory,
      {
        from: this.myAcc,
      },
    )
    console.log('investContract: ', this.investContract)
    this.moneyVaultContract = new this.web3.eth.Contract(
      this.moneyVaultABI,
      this.locator.MoneyVaultFactory,
      {
        from: this.myAcc,
      },
    )
    console.log('moneyVaultContract: ', this.moneyVaultContract)

    this.insureeCoinContract = new this.web3.eth.Contract(
      this.insureeCoinABI,
      this.locator.TokenFactory,
      {
        from: this.myAcc,
      },
    )
    console.log('insureeCoinContract: ', this.insureeCoinContract)
    this.investorCoinContract = new this.web3.eth.Contract(
      this.investorCoinABI,
      this.locator.TokenFactory,
      {
        from: this.myAcc,
      },
    )
    console.log('investorCoinContract: ', this.investorCoinContract)
    this.testStuff()
  }

  private async init() {
    await Promise.all([
      this.web3.eth.getAccounts().then(accounts => (this.myAcc = accounts[0])),
      this.getFiles(),
    ])

    this.getContracts()
  }

  private async commitSingleBlockChainInsurance(
    data: BlockChainInvestment,
    rawInsurances: BlockChainInsurace[],
  ) {
    const insIndex = rawInsurances.findIndex(
      ins =>
        ins.risk === data.risk &&
        ins.month === new Date(data.startSecond * 1000).getMonth() &&
        ins.year === new Date(data.startSecond * 1000).getFullYear() &&
        ins.bonus === data.bonus,
    )
    console.log('rawInsurances: ', rawInsurances)
    console.log('newInvestment: ', data)
    let moneyVaultAdress: string

    console.log('insIndex: ', insIndex)
    if (insIndex !== -1) {
      console.log('found it: ', rawInsurances[insIndex])
    }

    if (insIndex === -1) {
      console.log('insurancee cant create new insurances')
      throw new Error('Insurees cant create new insurance Contracts')
    }
    console.log('insuranceContract exists...', rawInsurances[insIndex])

    moneyVaultAdress = rawInsurances[insIndex].moneyVault
    const moneyVault = this.getMoneyVault(moneyVaultAdress)
    console.log('moneyVault: ', moneyVault)
    console.log((data.volume * data.bonus) / TEST_MULTIPLIER)

    const moneyVaultRes = await moneyVault.methods.insureeDeposits().send({
      from: this.myAcc,
      value: this.web3.utils.toWei(
        ((data.volume * data.bonus) / TEST_MULTIPLIER).toString(),
        'ether',
      ),
    })

    const moneyVaultEvents = await this.moneyVaultContract.getPastEvents(
      'allEvents',
    )

    console.log('moneyVaultRes', moneyVaultRes)
    console.log('moneyVaultEvents: ', moneyVaultEvents)
    return true
  }

  async commitBlockChainInsurance(dataArr: BlockChainInvestment[]) {
    const [insurances, rawInsurances] = await this.getInsuranceData()
    const insuranceNotExist = dataArr.some(data => {
      const insIndex = rawInsurances.findIndex(
        ins =>
          ins.risk === data.risk &&
          ins.month === new Date(data.startSecond * 1000).getMonth() &&
          ins.year === new Date(data.startSecond * 1000).getFullYear() &&
          ins.bonus === data.bonus,
      )
      return insIndex === -1
    })
    if (insuranceNotExist) {
      throw new Error('Insurees cant create new insurance Contracts')
    }
    return Promise.all(
      dataArr.map(data =>
        this.commitSingleBlockChainInsurance(data, rawInsurances),
      ),
    )
  }

  async commitBlockChainInvestment(data: BlockChainInvestment) {
    const tokenNameInvest = `${data.risk} investor ${data.bonus * 100}%`
    const tokenNameInsuree = `${data.risk} insuree ${data.bonus * 100}%`
    const rateInPercent = (data.bonus * 100).toString(); //not 1e18 or comma!

    const [insurances, rawInsurances] = await this.getInsuranceData()
    const insIndex = rawInsurances.findIndex(
      ins =>
        ins.risk === data.risk &&
        ins.month === new Date(data.startSecond * 1000).getMonth() &&
        ins.year === new Date(data.startSecond * 1000).getFullYear() &&
        ins.bonus === data.bonus,
    )
    console.log('rawInsurances: ', rawInsurances)
    console.log('newInvestment: ', data)
    let moneyVaultAdress: string

    console.log('insIndex: ', insIndex)
    if (insIndex !== -1) {
      console.log('found it: ', rawInsurances[insIndex])
    }

    if (insIndex === -1) {
      console.log('create new insuranceContract..')
      const res = await this.investContract.methods
        .createInsuranceFor(
          tokenNameInvest,
          tokenNameInsuree,
          data.startSecond.toString(),
          data.endSecond.toString(),
          Math.floor(Date.now() / 1000).toString(),
          data.validUntilSecond.toString(),
          rateInPercent,
        )
        .send()

      console.log('investContract createInsuranceFor res: ', res)

      const allEvents: InsuranceCreatedEvent[] = await this.investContract.getPastEvents(
        'InsuranceCreated',
        {
          fromBlock: ContractsService.fromBlock,
          toBlock: 'latest',
        },
      )

      console.log('allEvents: ', allEvents)

      const currentInsuranceCreatedEvent = allEvents.pop()
      const currentInvestmentBasisData = this.getInvestmentBasisDataFromEvent(
        currentInsuranceCreatedEvent,
      )
      console.log('currentInvestmentBasisData: ', currentInvestmentBasisData)
      moneyVaultAdress = currentInvestmentBasisData.moneyVault
    } else {
      console.log('insuranceContract exists...', rawInsurances[insIndex])
      moneyVaultAdress = rawInsurances[insIndex].moneyVault // get cached insurances
    }
    const moneyVault = this.getMoneyVault(moneyVaultAdress)
    console.log('moneyVault: ', moneyVault)

    const moneyVaultRes = await moneyVault.methods.investorDeposits().send({
      from: this.myAcc,
      value: this.web3.utils.toWei(
        (data.volume / TEST_MULTIPLIER).toString(),
        'ether',
      ),
    })

    const moneyVaultEvents = await this.moneyVaultContract.getPastEvents(
      'allEvents',
    )

    console.log('moneyVaultRes', moneyVaultRes)
    console.log('moneyVaultEvents: ', moneyVaultEvents)
    return true
  }
}
