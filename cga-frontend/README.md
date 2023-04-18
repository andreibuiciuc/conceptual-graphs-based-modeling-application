<details>

<summary>ORDER BY: Cassandra CQL restrictions</summary>

### ORDER BY: Cassandra CQL restrictions mapped to FE functionalities

In Cassandra, the CQL restricts the use of the ORDER BY clause, as its impact on performance scale together as the size of the data set. In practice, the data model needs to be optimized and built following the bluprint of the queries that are planned to be executed frequently in order to leverage
the power of the system's design. 

The following restrictions of the Cassandra Query Language are mapped in the CGA application:

- [x] order by clause can only be used on clustering columns
- [x] order by clause can only be used if all parition key columns are restricted in the where clause
- [ ] order by clause can only be used in **descending** order for clustering columns that were defined with the **desc** keyword 

</details>
