items = ["apple","machine","computer","Books","Plants"]

print("!!! Welcome To The Mall !!!")
item_to_buy = input("What do you want to buy ? : " + str(items))

item_to_buy = item_to_buy.lower()

if item_to_buy[0] :
    print("It will be 1.99$")
    answer = input("Are You Sure You Want To Buy This ? (yes/no)")
    if answer == "yes" :
        print("Succefully paid Thank You")
    else:
        print("Payment Declined ⚠️")