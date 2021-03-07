"""empty message

Revision ID: 0d41bcca000a
Revises: 63290fa87bd3
Create Date: 2021-03-06 01:27:51.089709

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0d41bcca000a'
down_revision = '63290fa87bd3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('lendings', sa.Column('is_returned', sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('lendings', 'is_returned')
    # ### end Alembic commands ###
