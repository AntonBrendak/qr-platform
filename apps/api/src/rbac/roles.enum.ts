/** Роли внутри одного tenant (бренда/кафе).
 *  owner   — владелец/админ бренда (полный доступ)
 *  manager — менеджер (управление меню, локациями, персоналом)
 *  waiter  — официант (заказы/оплаты на смене)
 *  kitchen — кухня (экран кухни, статусы блюд)
 *  guest   — гость (витрина/оформление заказа)
 */
export enum Role {
  owner = 'owner',
  manager = 'manager',
  waiter = 'waiter',
  kitchen = 'kitchen',
  guest = 'guest',
}