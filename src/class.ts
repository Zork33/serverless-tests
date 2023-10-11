// import go from './class-method';

export class A {
  private priv: number = 1;
  protected prot: number = 2;
  public pub: number = 3;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  go = require('./class-method').default;
}
