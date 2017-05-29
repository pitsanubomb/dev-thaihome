




// STORE FUNCTION

function getNextSequence(collectionName) {
   var ret = db.counters.findAndModify(
          {
            query: { _id: collectionName},
            update: { $inc: { seq: 1 } },
            new: true,
            upsert: true
          }
   );
   return ret.seq;
}


// INSERT DOC

receiptTable.insert(
   {
     _id: getNextSequence("receipt"),
    invoiceNo: 123, 
    bookingId: "MQU88", 
    paidDate: NumberInt(1489430780), 
    amount: NumberInt(2000), 
    account: "Krungsri", 
    managerId: "4M4KE", 
  }
)


