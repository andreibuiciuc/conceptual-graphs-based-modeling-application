<details>

<summary>WHERE: Cassandra CQL restrictions</summary>

### WHERE: Cassandra CQL restrictions mapped to FE functionalities

The following restrictions of the Cassandra Query Language are mapped in the CGA application:

- [x] :key: **partition key** columns: the only supported conditional operators are **=** and **IN(value1, value2[,...])**
- [ ] :old_key:	**clustering** columns: only the lowest level clustering column (the last clustering column in the table definition) accepts the conditional operators **>, >=, <, or <=**; the other higher level columns can only be restricted with the **=** or **IN(value1, value2[,...])**, in the same order as their definition
- [x] restriction for all column of the partition key is mandatory for composite keys

</details>

<details>

<summary>ORDER BY: Cassandra CQL restrictions</summary>

### ORDER BY: Cassandra CQL restrictions mapped to FE functionalities

In Cassandra, the CQL restricts the use of the ORDER BY clause, as its impact on performance scale together as the size of the data set. In practice, the data model needs to be optimized and built following the bluprint of the queries that are planned to be executed frequently in order to leverage
the power of the system's design. 

The following restrictions of the Cassandra Query Language are mapped in the CGA application:

- [x] order by clause can only be used on :old_key: **clustering** columns
- [x] order by clause can only be used if all :key: **partition key** columns are restricted in the where clause
- [ ] order by clause can only be used in **descending** order for :old_key: **clustering** columns that were defined with the **desc** keyword 

</details>
